from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.nav_link import NavLink
from app.models.page import Page
from app.schemas.nav_link import NavLinkOut

router = APIRouter(tags=["public"])


@router.get("/nav-links", response_model=list[NavLinkOut])
def list_nav_links(db: Session = Depends(get_db)):
    return (
        db.query(NavLink)
        .outerjoin(NavLink.page)
        .filter((Page.published == True) | (NavLink.page_id == None))
        .order_by(NavLink.position.asc())
        .all()
    )
