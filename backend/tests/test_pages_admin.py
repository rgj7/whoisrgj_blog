async def test_create_page(client, auth_headers):
    response = await client.post(
        "/api/admin/pages",
        json={"title": "About Me", "slug": "about", "content": "# About", "published": True},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "About Me"
    assert data["slug"] == "about"


async def test_create_page_duplicate_slug(client, auth_headers):
    payload = {"title": "Contact", "slug": "contact", "content": "Body", "published": False}
    r1 = await client.post("/api/admin/pages", json=payload, headers=auth_headers)
    r2 = await client.post("/api/admin/pages", json=payload, headers=auth_headers)
    assert r1.status_code == 201
    assert r2.status_code == 409


async def test_get_page_nonexistent(client):
    response = await client.get("/api/pages/no-such-page")
    assert response.status_code == 404


async def test_get_page_draft_is_404(client, auth_headers):
    await client.post(
        "/api/admin/pages",
        json={"title": "Draft Page", "slug": "draft-page", "content": "Body", "published": False},
        headers=auth_headers,
    )
    response = await client.get("/api/pages/draft-page")
    assert response.status_code == 404


async def test_get_page_published(client, auth_headers):
    await client.post(
        "/api/admin/pages",
        json={"title": "Live Page", "slug": "live-page", "content": "# Live", "published": True},
        headers=auth_headers,
    )
    response = await client.get("/api/pages/live-page")
    assert response.status_code == 200
    assert response.json()["title"] == "Live Page"
