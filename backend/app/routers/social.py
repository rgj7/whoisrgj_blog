from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.social_link import SocialLink
from app.schemas.social_link import SocialLinkOut

router = APIRouter(tags=["public"])


@router.get("/social-links", response_model=list[SocialLinkOut])
async def list_social_links(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(SocialLink).order_by(SocialLink.position.asc()))).scalars().all()
