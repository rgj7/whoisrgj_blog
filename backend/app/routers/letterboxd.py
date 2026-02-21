import re
import time
import xml.etree.ElementTree as ET

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

RSS_URL = "https://letterboxd.com/rawool7/rss/"
LB_NS = "https://letterboxd.com"

_cache: dict = {}


def _parse_feed(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    channel = root.find("channel")
    items = channel.findall("item") if channel is not None else []

    results = []
    for item in items:
        rating_el = item.find(f"{{{LB_NS}}}memberRating")
        if rating_el is None:
            continue
        title_el = item.find(f"{{{LB_NS}}}filmTitle")
        year_el = item.find(f"{{{LB_NS}}}filmYear")
        link_el = item.find("link")
        desc_el = item.find("description")
        poster_url = None
        if desc_el is not None and desc_el.text:
            m = re.search(r'<img src="([^"]+)"', desc_el.text)
            if m:
                poster_url = m.group(1)
        results.append(
            {
                "title": title_el.text if title_el is not None else "",
                "year": int(year_el.text) if year_el is not None else None,
                "rating": float(rating_el.text),
                "url": link_el.text if link_el is not None else "",
                "poster_url": poster_url,
            }
        )
        if len(results) == 5:
            break
    return results


@router.get("/letterboxd")
async def get_recently_watched():
    now = time.time()
    if _cache.get("expires", 0) > now:
        return _cache["data"]

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(RSS_URL)
            response.raise_for_status()
        films = _parse_feed(response.text)
        _cache["data"] = films
        _cache["expires"] = now + 3600
        return films
    except Exception:
        if "data" in _cache:
            return _cache["data"]
        raise HTTPException(status_code=503, detail="Could not fetch Letterboxd feed")
