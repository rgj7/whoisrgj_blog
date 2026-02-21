from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.page import Page
from app.schemas.page import PageOut

router = APIRouter(tags=["public"])


@router.get("/pages/{slug}", response_model=PageOut)
async def get_page(slug: str, db: AsyncSession = Depends(get_db)) -> PageOut:
    page = (
        await db.execute(select(Page).where(Page.slug == slug, Page.published == True))  # noqa: E712
    ).scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page  # type: ignore[return-value]
