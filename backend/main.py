import os
import asyncio
import math
from datetime import datetime, timedelta
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Job Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "")


class SearchFilters(BaseModel):
    keyword: str = ""
    job_types: list[str] = []
    sector: str = ""
    education_level: str = ""
    country: str = "France"
    city: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius: int = 50
    date_filter: str = ""


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def filter_by_date(posted_date: str, date_filter: str) -> bool:
    if not date_filter or not posted_date:
        return True
    try:
        posted = datetime.fromisoformat(posted_date.replace("Z", "+00:00")).replace(tzinfo=None)
        now = datetime.utcnow()
        if date_filter == "24h":
            return (now - posted) <= timedelta(hours=24)
        elif date_filter == "7d":
            return (now - posted) <= timedelta(days=7)
        elif date_filter == "30d":
            return (now - posted) <= timedelta(days=30)
    except Exception:
        return True
    return True


async def fetch_arbeitnow(client: httpx.AsyncClient, filters: SearchFilters) -> list[dict]:
    jobs = []
    try:
        params = {"page": 1}
        resp = await client.get("https://www.arbeitnow.com/api/job-board-api", params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        for item in data.get("data", [])[:50]:
            location = item.get("location", "") or ""
            job = {
                "id": f"arbeitnow_{item.get('slug', '')}",
                "title": item.get("title", ""),
                "company": item.get("company_name", ""),
                "location": location,
                "lat": None,
                "lng": None,
                "type": "CDI" if not item.get("remote") else "Remote",
                "sector": "",
                "education_level": "",
                "description": item.get("description", "")[:300],
                "url": item.get("url", ""),
                "source": "Arbeitnow",
                "posted_date": item.get("created_at", ""),
                "salary": "",
            }
            tags = item.get("tags", [])
            if tags:
                job["sector"] = tags[0] if tags else ""
            jobs.append(job)
    except Exception as e:
        print(f"Arbeitnow error: {e}")
    return jobs


async def fetch_labonnealternance(client: httpx.AsyncClient, filters: SearchFilters) -> list[dict]:
    jobs = []
    try:
        lat = filters.lat or 48.8566
        lng = filters.lng or 2.3522
        radius = filters.radius or 30

        romes = "M1805,M1802,M1801"

        params = {
            "latitude": lat,
            "longitude": lng,
            "radius": radius,
            "caller": "jobsearch-app",
            "romes": romes,
        }

        url = "https://labonnealternance.apprentissage.beta.gouv.fr/api/V1/formationsParRegion"
        resp = await client.get(url, params=params, timeout=15)

        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results", [])

            for item in results[:30]:
                if item.get("ideaType") != "formation":
                    continue
                place = item.get("place", {}) or {}
                company = item.get("company", {}) or {}
                jobs.append({
                    "id": f"lba_{item.get('id', '')}",
                    "title": item.get("title", "Alternance"),
                    "company": company.get("name", ""),
                    "location": place.get("city", place.get("fullAddress", "")),
                    "lat": place.get("latitude"),
                    "lng": place.get("longitude"),
                    "type": "Alternance",
                    "sector": "",
                    "education_level": item.get("diploma", {}).get("label", "") if isinstance(item.get("diploma"), dict) else "",
                    "description": item.get("title", ""),
                    "url": item.get("url", "https://labonnealternance.apprentissage.beta.gouv.fr"),
                    "source": "La Bonne Alternance",
                    "posted_date": "",
                    "salary": "",
                })
        else:
            print(f"LaBonneAlternance returned {resp.status_code}: {resp.text[:200]}")
            url2 = "https://api.apprentissage.beta.gouv.fr/api/job/v1/search"
            params2 = {"latitude": lat, "longitude": lng, "radius": radius, "romes": romes}
            resp2 = await client.get(url2, params=params2, timeout=15)
            if resp2.status_code == 200:
                data2 = resp2.json()
                for item in data2.get("results", [])[:30]:
                    jobs.append({
                        "id": f"lba_{item.get('id', '')}",
                        "title": item.get("title", "Alternance"),
                        "company": item.get("company", {}).get("name", "") if isinstance(item.get("company"), dict) else "",
                        "location": item.get("place", {}).get("city", "") if isinstance(item.get("place"), dict) else "",
                        "lat": None,
                        "lng": None,
                        "type": "Alternance",
                        "sector": "",
                        "education_level": "",
                        "description": item.get("title", ""),
                        "url": item.get("url", ""),
                        "source": "La Bonne Alternance",
                        "posted_date": "",
                        "salary": "",
                    })
    except Exception as e:
        print(f"LaBonneAlternance error: {e}")
    return jobs


async def fetch_adzuna(client: httpx.AsyncClient, filters: SearchFilters) -> list[dict]:
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return []
    jobs = []
    try:
        country_code = "fr"
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": 20,
            "what": filters.keyword or "developer",
        }
        if filters.city:
            params["where"] = filters.city
        resp = await client.get(
            f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/1",
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        for item in data.get("results", []):
            loc = item.get("location", {})
            jobs.append({
                "id": f"adzuna_{item.get('id', '')}",
                "title": item.get("title", ""),
                "company": item.get("company", {}).get("display_name", ""),
                "location": loc.get("display_name", ""),
                "lat": item.get("latitude"),
                "lng": item.get("longitude"),
                "type": item.get("contract_time", "CDI"),
                "sector": item.get("category", {}).get("label", ""),
                "education_level": "",
                "description": item.get("description", "")[:300],
                "url": item.get("redirect_url", ""),
                "source": "Adzuna",
                "posted_date": item.get("created", ""),
                "salary": f"{item.get('salary_min', '')} - {item.get('salary_max', '')}" if item.get("salary_min") else "",
            })
    except Exception as e:
        print(f"Adzuna error: {e}")
    return jobs


@app.post("/api/search")
async def search_jobs(filters: SearchFilters):
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(
            fetch_arbeitnow(client, filters),
            fetch_labonnealternance(client, filters),
            fetch_adzuna(client, filters),
            return_exceptions=True,
        )

    all_jobs = []
    for result in results:
        if isinstance(result, list):
            all_jobs.extend(result)

    # RELAXED FILTERS — only filter if explicitly selected
    # Job type: only filter when user explicitly selected types AND job has a type
    if filters.job_types:
        type_lower = [t.lower() for t in filters.job_types]
        all_jobs = [j for j in all_jobs if not j.get("type") or
                    any(t in j.get("type", "").lower() for t in type_lower)]

    # Keyword: only apply local filter if API already returned results with keyword
    if filters.keyword:
        kw = filters.keyword.lower()
        kw_filtered = [j for j in all_jobs if
                       kw in j.get("title", "").lower() or
                       kw in j.get("description", "").lower() or
                       kw in j.get("company", "").lower() or
                       kw in j.get("sector", "").lower()]
        if kw_filtered:
            all_jobs = kw_filtered
        # else: keep all results (API-level search is enough)

    # Filter by radius if location set
    if filters.lat and filters.lng:
        filtered = []
        for j in all_jobs:
            if j.get("lat") and j.get("lng"):
                dist = haversine_km(filters.lat, filters.lng, j["lat"], j["lng"])
                if dist <= filters.radius:
                    filtered.append(j)
            else:
                filtered.append(j)
        all_jobs = filtered

    # Filter by date
    if filters.date_filter:
        all_jobs = [j for j in all_jobs if filter_by_date(j.get("posted_date", ""), filters.date_filter)]

    return {"jobs": all_jobs, "total": len(all_jobs)}


@app.get("/api/geocode")
async def geocode(q: str = Query(...)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": q, "format": "json", "limit": 5},
            headers={"User-Agent": "JobSearchApp/1.0"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# Serve static frontend in production
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os as _os

_static_dir = _os.path.join(_os.path.dirname(__file__), "static")
if _os.path.exists(_static_dir):
    app.mount("/assets", StaticFiles(directory=_os.path.join(_static_dir, "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = _os.path.join(_static_dir, full_path)
        if _os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(_os.path.join(_static_dir, "index.html"))
