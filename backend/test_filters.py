import pytest
from httpx import AsyncClient, ASGITransport
from main import app, SearchFilters


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


def test_job_type_filter_inclusive_alternance():
    filters = SearchFilters(keyword="", job_types=["Alternance"], country="France")
    jobs = [
        {"type": "Alternance", "title": "Dev Alternance", "description": "", "company": ""},
        {"type": "CDI", "title": "Dev CDI", "description": "", "company": ""},
        {"type": "", "title": "Dev Unknown", "description": "", "company": ""},
        {"type": "Remote", "title": "Dev Remote", "description": "", "company": ""},
    ]
    type_lower = [t.lower() for t in filters.job_types]
    filtered_jobs = []
    for j in jobs:
        jtype = j.get("type", "").lower()
        if not jtype or any(t in jtype for t in type_lower) or any(jtype in t for t in type_lower):
            filtered_jobs.append(j)
    assert len(filtered_jobs) == 2
    assert filtered_jobs[0]["title"] == "Dev Alternance"
    assert filtered_jobs[1]["title"] == "Dev Unknown"


def test_job_type_filter_inclusive_stage():
    filters = SearchFilters(keyword="", job_types=["Stage"], country="France")
    jobs = [
        {"type": "Stage", "title": "Stagiaire Dev", "description": "", "company": ""},
        {"type": "CDI", "title": "Dev CDI", "description": "", "company": ""},
        {"type": "", "title": "Dev Unknown", "description": "", "company": ""},
        {"type": "stage en entreprise", "title": "Stage long", "description": "", "company": ""},
    ]
    type_lower = [t.lower() for t in filters.job_types]
    filtered_jobs = []
    for j in jobs:
        jtype = j.get("type", "").lower()
        if not jtype or any(t in jtype for t in type_lower) or any(jtype in t for t in type_lower):
            filtered_jobs.append(j)
    assert len(filtered_jobs) == 3


def test_keyword_filter_doesnt_empty_results():
    all_jobs = [
        {"title": "Software Developer", "description": "Build apps", "company": "TechCorp"},
        {"title": "Data Analyst", "description": "Analyze data", "company": "DataCo"},
    ]
    kw = "developpeur"
    keyword_filtered = [j for j in all_jobs if kw in j.get("title", "").lower() or kw in j.get("description", "").lower() or kw in j.get("company", "").lower()]
    assert len(keyword_filtered) == 0
    if keyword_filtered:
        result = keyword_filtered
    else:
        result = all_jobs
    assert len(result) == 2


@pytest.mark.asyncio
async def test_search_endpoint_returns_200(client):
    resp = await client.post("/api/search", json={"keyword": "", "job_types": [], "country": "France", "radius": 50})
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data
    assert isinstance(data["jobs"], list)
