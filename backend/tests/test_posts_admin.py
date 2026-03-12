from app.models.tag import Tag


async def _create_tag(db, name):
    from slugify import slugify

    tag = Tag(name=name, slug=slugify(name))
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


async def test_create_post(client, auth_cookies):
    response = await client.post(
        "/api/admin/posts",
        json={"title": "Hello World", "content": "Body text", "published": False, "tag_ids": [], "media": []},
        cookies=auth_cookies,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Hello World"
    assert data["slug"] == "hello-world"


async def test_create_post_slug_suffix_on_duplicate_title(client, auth_cookies):
    payload = {"title": "Duplicate Title", "content": "Body", "published": False, "tag_ids": [], "media": []}
    r1 = await client.post("/api/admin/posts", json=payload, cookies=auth_cookies)
    r2 = await client.post("/api/admin/posts", json=payload, cookies=auth_cookies)
    assert r1.status_code == 201
    assert r2.status_code == 201
    assert r1.json()["slug"] == "duplicate-title"
    assert r2.json()["slug"] == "duplicate-title-1"


async def test_create_post_with_valid_tag(client, auth_cookies, db_session):
    tag = await _create_tag(db_session, "FastAPI")
    response = await client.post(
        "/api/admin/posts",
        json={
            "title": "Tagged Post",
            "content": "Body",
            "published": False,
            "tag_ids": [tag.id],
            "media": [],
        },
        cookies=auth_cookies,
    )
    assert response.status_code == 201
    tags = response.json()["tags"]
    assert len(tags) == 1
    assert tags[0]["name"] == "FastAPI"


async def test_create_post_with_invalid_tag(client, auth_cookies):
    response = await client.post(
        "/api/admin/posts",
        json={"title": "Bad Tag Post", "content": "Body", "published": False, "tag_ids": [9999], "media": []},
        cookies=auth_cookies,
    )
    assert response.status_code == 400


async def test_get_post(client, auth_cookies):
    created = await client.post(
        "/api/admin/posts",
        json={"title": "Fetchable Post", "content": "Body", "published": False, "tag_ids": [], "media": []},
        cookies=auth_cookies,
    )
    post_id = created.json()["id"]
    response = await client.get(f"/api/admin/posts/{post_id}", cookies=auth_cookies)
    assert response.status_code == 200
    assert response.json()["title"] == "Fetchable Post"


async def test_get_post_nonexistent(client, auth_cookies):
    response = await client.get("/api/admin/posts/99999", cookies=auth_cookies)
    assert response.status_code == 404


async def test_update_post(client, auth_cookies):
    created = await client.post(
        "/api/admin/posts",
        json={"title": "Original Title", "content": "Original", "published": False, "tag_ids": [], "media": []},
        cookies=auth_cookies,
    )
    post_id = created.json()["id"]
    response = await client.put(
        f"/api/admin/posts/{post_id}",
        json={"title": "Updated Title", "content": "Updated content"},
        cookies=auth_cookies,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["content"] == "Updated content"


async def test_delete_post(client, auth_cookies):
    created = await client.post(
        "/api/admin/posts",
        json={"title": "To Be Deleted", "content": "Body", "published": False, "tag_ids": [], "media": []},
        cookies=auth_cookies,
    )
    post_id = created.json()["id"]

    delete_response = await client.delete(f"/api/admin/posts/{post_id}", cookies=auth_cookies)
    assert delete_response.status_code == 204

    get_response = await client.get(f"/api/admin/posts/{post_id}", cookies=auth_cookies)
    assert get_response.status_code == 404


async def test_delete_post_nonexistent(client, auth_cookies):
    response = await client.delete("/api/admin/posts/99999", cookies=auth_cookies)
    assert response.status_code == 404


async def test_create_duplicate_tag(client, auth_cookies):
    payload = {"name": "Unique Tag"}
    r1 = await client.post("/api/admin/tags", json=payload, cookies=auth_cookies)
    r2 = await client.post("/api/admin/tags", json=payload, cookies=auth_cookies)
    assert r1.status_code == 201
    assert r2.status_code == 409
