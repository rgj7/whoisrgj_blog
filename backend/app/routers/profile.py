from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.site_profile import SiteProfile
from app.schemas.site_profile import SiteProfileOut

router = APIRouter(tags=["public"])


@router.get("/profile", response_model=SiteProfileOut)
async def get_profile(db: AsyncSession = Depends(get_db)):
    profile = (await db.execute(select(SiteProfile).where(SiteProfile.id == 1))).scalar_one_or_none()
    if not profile:
        return SiteProfileOut()
    return profile
