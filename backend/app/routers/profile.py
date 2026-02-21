from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.site_profile import SiteProfile
from app.schemas.site_profile import SiteProfileOut

router = APIRouter(tags=["public"])


@router.get("/profile", response_model=SiteProfileOut)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(SiteProfile).filter(SiteProfile.id == 1).first()
    if not profile:
        return SiteProfileOut()
    return profile
