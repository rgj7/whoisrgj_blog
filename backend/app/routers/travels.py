from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.visited_country import VisitedCountry
from app.models.wanted_country import WantedCountry
from app.schemas.visited_country import VisitedCountryOut
from app.schemas.wanted_country import WantedCountryOut

router = APIRouter(tags=["public"])


@router.get("/travels", response_model=list[VisitedCountryOut])
async def list_visited_countries(db: AsyncSession = Depends(get_db)) -> list[VisitedCountryOut]:
    return (await db.execute(select(VisitedCountry).order_by(VisitedCountry.name.asc()))).scalars().all()  # type: ignore[return-value]


@router.get("/travels/wishlist", response_model=list[WantedCountryOut])
async def list_wanted_countries(db: AsyncSession = Depends(get_db)) -> list[WantedCountryOut]:
    return (await db.execute(select(WantedCountry).order_by(WantedCountry.name.asc()))).scalars().all()  # type: ignore[return-value]
