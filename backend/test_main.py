import pytest
from httpx import AsyncClient, ASGITransport
from main import app, haversine_km, filter_by_date


@pytest.fixture
def client():
    import asyncio
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_search_empty(client):
    resp = await client.post("/api/search", json={"keyword": ""})
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data
    assert "total" in data
    assert isinstance(data["jobs"], list)


@pytest.mark.asyncio
async def test_search_with_keyword(client):
    resp = await client.post("/api/search", json={"keyword": "python", "country": "France"})
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data


@pytest.mark.asyncio
async def test_geocode(client):
    resp = await client.get("/api/geocode", params={"q": "Paris, France"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "lat" in data[0]
        assert "lon" in data[0]


def test_haversine():
    dist = haversine_km(48.8566, 2.3522, 45.764, 4.8357)
    assert 380 < dist < 400


def test_filter_by_date_empty():
    assert filter_by_date("", "24h") is True
    assert filter_by_date("2026-07-25T10:00:00", "") is True


def test_filter_by_date_recent():
    from datetime import datetime, timedelta
    recent = (datetime.utcnow() - timedelta(hours=5)).isoformat()
    assert filter_by_date(recent, "24h") is True
    old = (datetime.utcnow() - timedelta(days=10)).isoformat()
    assert filter_by_date(old, "7d") is False
