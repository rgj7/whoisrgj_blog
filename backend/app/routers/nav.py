from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models.nav_link import NavLink
from app.models.page import Page
from app.schemas.nav_link import NavLinkOut

router = APIRouter(tags=["public"])


@router.get("/nav-links", response_model=list[NavLinkOut])
async def list_nav_links(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(NavLink)
        .outerjoin(NavLink.page)
        .where(or_(Page.published == True, NavLink.page_id == None))  # noqa: E711,E712
        .order_by(NavLink.position.asc())
    )
    return (await db.execute(stmt)).scalars().all()
