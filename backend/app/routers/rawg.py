import httpx
from fastapi import APIRouter, HTTPException, Query

from app.config import settings

router = APIRouter()

RAWG_BASE = "https://api.rawg.io/api"


@router.get("/rawg/search")
async def rawg_search(q: str = Query(..., min_length=1)) -> list[dict[str, str | None]]:
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
