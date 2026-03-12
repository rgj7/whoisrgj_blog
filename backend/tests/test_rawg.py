from unittest.mock import AsyncMock, MagicMock, patch

import app.routers.rawg as rawg_module
from app.models.post_media import PostMedia


async def test_rawg_game_detail_no_post_media_is_404(client):
    rawg_module._game_cache.clear()
    response = await client.get("/api/rawg/games/99999")
    assert response.status_code == 404


async def test_rawg_game_detail_with_post_media(client, auth_cookies, db_session):
    rawg_module._game_cache.clear()

    from app.models.post import Post

    post = Post(title="Half-Life 2 Review", slug="half-life-2-review", content="Body", published=True)
    db_session.add(post)
    await db_session.commit()
    await db_session.refresh(post)

    media = PostMedia(
        post_id=post.id,
        media_type="game",
        external_id="123",
        title="Half-Life 2",
        background_image_url="https://example.com/cover.jpg",
    )
    db_session.add(media)
    await db_session.commit()

    fake_response_data = {
        "name": "Half-Life 2",
        "slug": "half-life-2",
        "description_raw": "A great game.",
        "released": "2004-11-16",
        "esrb_rating": {"name": "Mature"},
        "metacritic": 96,
        "metacritic_url": "https://metacritic.com/game/half-life-2",
        "genres": [{"name": "Action"}, {"name": "Shooter"}],
        "platforms": [{"platform": {"name": "PC"}}],
        "developers": [{"name": "Valve"}],
        "publishers": [{"name": "Valve"}],
    }

    mock_response = MagicMock()
    mock_response.json.return_value = fake_response_data
    mock_response.raise_for_status = MagicMock()

    mock_client_instance = AsyncMock()
    mock_client_instance.get = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=False)

    with patch("app.routers.rawg.httpx.AsyncClient", return_value=mock_client_instance):
        response = await client.get("/api/rawg/games/123")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Half-Life 2"
    assert "Action" in data["genres"]
    assert "PC" in data["platforms"]
    assert data["rawg_slug"] == "half-life-2"
