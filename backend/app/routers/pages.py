from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.page import Page
from app.schemas.page import PageOut

router = APIRouter(tags=["public"])


@router.get("/pages/{slug}", response_model=PageOut)
def get_page(slug: str, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.slug == slug, Page.published == True).first()  # noqa: E712
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page
