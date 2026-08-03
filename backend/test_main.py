import pytest
from httpx import AsyncClient, ASGITransport
from main import app, haversine_km, filter_by_date
from rome_codes import get_rome_code, get_rome_codes, ROME_CODES, normalize_text


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


# ─── ROME Code Tests ──────────────────────────────────────────────────────────

class TestRomeCodes:
    def test_dict_size(self):
        """Verify we have 300+ entries."""
        assert len(ROME_CODES) >= 300

    def test_exact_match(self):
        assert get_rome_code("chaudronnier") == "H2912"
        assert get_rome_code("soudeur") == "H2913"
        assert get_rome_code("développeur") == "M1805"
        assert get_rome_code("maintenance") == "I1304"
        assert get_rome_code("infirmier") == "J1506"
        assert get_rome_code("maçon") == "F1703"
        assert get_rome_code("cuisinier") == "G1602"

    def test_partial_match(self):
        assert get_rome_code("chaudronnier industriel") == "H2912"
        assert get_rome_code("technicien maintenance") != ""
        assert get_rome_code("soudeur TIG") == "H2913"
        assert get_rome_code("aide soignante") == "J1501"

    def test_case_insensitive(self):
        assert get_rome_code("CHAUDRONNIER") == "H2912"
        assert get_rome_code("Soudeur") == "H2913"
        assert get_rome_code("INFIRMIER") == "J1506"

    def test_accent_insensitive(self):
        """Must work without accents too."""
        assert get_rome_code("mecanicien") != ""
        assert get_rome_code("electricien") != ""
        assert get_rome_code("developpeur") == "M1805"
        assert get_rome_code("secretaire") != ""

    def test_no_match(self):
        assert get_rome_code("xyz_unknown_job_zzz") == ""
        assert get_rome_code("") == ""

    def test_cnd(self):
        assert get_rome_code("contrôle non destructif") == "H1504"
        assert get_rome_code("cnd") == "H1504"
        assert get_rome_code("controle non destructif") == "H1504"

    def test_multiple_codes(self):
        """get_rome_codes should return up to 3."""
        codes = get_rome_codes("chaudronnier")
        assert len(codes) >= 1
        assert "H2912" in codes

    def test_sectors_covered(self):
        """Verify all major sectors have entries."""
        assert get_rome_code("agriculteur") != ""
        assert get_rome_code("maçon") != ""
        assert get_rome_code("plombier") != ""
        assert get_rome_code("infirmier") != ""
        assert get_rome_code("médecin") != ""
        assert get_rome_code("chauffeur") != ""
        assert get_rome_code("cariste") != ""
        assert get_rome_code("vendeur") != ""
        assert get_rome_code("commercial") != ""
        assert get_rome_code("cuisinier") != ""
        assert get_rome_code("serveur") != ""
        assert get_rome_code("agent sécurité") != ""
        assert get_rome_code("pompier") != ""
        assert get_rome_code("développeur") != ""
        assert get_rome_code("administrateur réseau") != ""
        assert get_rome_code("comptable") != ""
        assert get_rome_code("graphiste") != ""
        assert get_rome_code("technicien éolien") != ""

    def test_normalize_text(self):
        assert normalize_text("Développeur") == "developpeur"
        assert normalize_text("Mécanicien") == "mecanicien"
        assert normalize_text("CHAUDRONNIER") == "chaudronnier"
        assert normalize_text("  aide-soignant  ") == "aide-soignant"


# ─── API Tests ────────────────────────────────────────────────────────────────

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
async def test_search_french_industrial(client):
    """Test that a French industrial search doesn't crash."""
    resp = await client.post("/api/search", json={
        "keyword": "chaudronnier",
        "job_types": ["Stage", "Alternance"],
        "country": "France",
        "city": "Lyon",
        "lat": 45.764,
        "lng": 4.8357,
        "radius": 35,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data
    assert isinstance(data["total"], int)


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


# ─── Source-specific unit tests ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_arbeitnow_skips_french_industrial():
    """Arbeitnow should skip French industrial queries."""
    from main import fetch_arbeitnow, SearchFilters
    import httpx
    filters = SearchFilters(keyword="chaudronnier", country="France")
    async with httpx.AsyncClient() as client:
        result = await fetch_arbeitnow(client, filters)
    assert result == []


@pytest.mark.asyncio
async def test_arbeitnow_skips_common_french():
    """Arbeitnow should skip common French job titles."""
    from main import fetch_arbeitnow, SearchFilters
    import httpx
    for kw in ["infirmier", "cuisinier", "vendeur", "chauffeur", "comptable"]:
        filters = SearchFilters(keyword=kw, country="France")
        async with httpx.AsyncClient() as client:
            result = await fetch_arbeitnow(client, filters)
        assert result == [], f"Arbeitnow should skip '{kw}' for France"
