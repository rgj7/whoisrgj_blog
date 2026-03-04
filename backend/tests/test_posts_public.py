from app.models.post import Post
from app.models.tag import Tag


async def _create_post(db, title, published=True, tags=None):
    from slugify import slugify

    post = Post(
        title=title,
        slug=slugify(title),
        content=f"Content of {title}",
        published=published,
        tags=tags or [],
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


async def _create_tag(db, name):
    from slugify import slugify

    tag = Tag(name=name, slug=slugify(name))
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


async def test_list_posts_empty(client):
    response = await client.get("/api/posts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


async def test_list_posts_only_published(client, db_session):
    await _create_post(db_session, "Published Post", published=True)
    await _create_post(db_session, "Draft Post", published=False)

    response = await client.get("/api/posts")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Published Post"


async def test_list_posts_pagination(client, db_session):
    for i in range(5):
        await _create_post(db_session, f"Post Number {i}", published=True)

    response = await client.get("/api/posts?page=1&size=3")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert data["size"] == 3
    assert data["pages"] == 2
    assert len(data["items"]) == 3

    response2 = await client.get("/api/posts?page=2&size=3")
    assert response2.status_code == 200
    assert len(response2.json()["items"]) == 2


async def test_get_post_published(client, db_session):
    post = await _create_post(db_session, "My Great Post", published=True)
    response = await client.get(f"/api/posts/{post.slug}")
    assert response.status_code == 200
    assert response.json()["title"] == "My Great Post"


async def test_get_post_draft_is_404(client, db_session):
    post = await _create_post(db_session, "My Draft Post", published=False)
    response = await client.get(f"/api/posts/{post.slug}")
    assert response.status_code == 404


async def test_get_post_nonexistent_is_404(client):
    response = await client.get("/api/posts/no-such-slug")
    assert response.status_code == 404


async def test_list_posts_tag_filter(client, db_session):
    tag = await _create_tag(db_session, "Python")
    await _create_post(db_session, "Python Post", published=True, tags=[tag])
    await _create_post(db_session, "Other Post", published=True)

    response = await client.get("/api/posts?tag=python")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Python Post"
