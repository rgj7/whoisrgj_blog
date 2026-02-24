import time

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.post_media import PostMedia

router = APIRouter()

RAWG_BASE = "https://api.rawg.io/api"

# module-level cache: game_id -> (data, expires_timestamp)
_game_cache: dict[str, tuple[dict[str, object], float]] = {}


@router.get("/rawg/search")
async def rawg_search(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
) -> list[dict[str, str | None]]:
    if not q.strip():
        return []
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{RAWG_BASE}/games",
                params={"key": settings.RAWG_API_KEY, "search": q, "page_size": 10},
            )
            response.raise_for_status()
        results = response.json().get("results", [])
        return [
            {
                "id": str(game["id"]),
                "name": game["name"],
                "background_image": game.get("background_image"),
            }
            for game in results
        ]
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"RAWG API error ({exc.response.status_code})") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Could not reach RAWG API") from exc


@router.get("/rawg/games/{game_id}")
async def rawg_game_detail(game_id: str, db: AsyncSession = Depends(get_db)) -> dict[str, object]:
    exists = (
        await db.execute(
            select(PostMedia.id).where(PostMedia.external_id == game_id, PostMedia.media_type == "game").limit(1)
        )
    ).scalar_one_or_none()
    if exists is None:
        raise HTTPException(status_code=404, detail="Game not found")

    now = time.time()
    cached = _game_cache.get(game_id)
    if cached is not None and cached[1] > now:
        return cached[0]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{RAWG_BASE}/games/{game_id}",
                params={"key": settings.RAWG_API_KEY},
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"RAWG API error ({exc.response.status_code})") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Could not reach RAWG API") from exc

    raw = response.json()

    esrb: str | None = None
    esrb_obj = raw.get("esrb_rating")
    if isinstance(esrb_obj, dict):
        esrb = esrb_obj.get("name")

    platforms: list[str] = []
    for entry in raw.get("platforms") or []:
        platform_obj = entry.get("platform")
        if isinstance(platform_obj, dict) and platform_obj.get("name"):
            platforms.append(platform_obj["name"])

    genres: list[str] = [g["name"] for g in (raw.get("genres") or []) if isinstance(g, dict) and g.get("name")]
    developers: list[str] = [d["name"] for d in (raw.get("developers") or []) if isinstance(d, dict) and d.get("name")]
    publishers: list[str] = [p["name"] for p in (raw.get("publishers") or []) if isinstance(p, dict) and p.get("name")]

    data: dict[str, object] = {
        "name": raw.get("name", ""),
        "description_raw": raw.get("description_raw", ""),
        "released": raw.get("released"),
        "esrb_rating": esrb,
        "genres": genres,
        "platforms": platforms,
        "developers": developers,
        "publishers": publishers,
        "metacritic": raw.get("metacritic"),
        "metacritic_url": raw.get("metacritic_url"),
        "rawg_slug": raw.get("slug", ""),
    }
    _game_cache[game_id] = (data, now + 3600)
    return data
