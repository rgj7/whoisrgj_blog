from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.visited_country import VisitedCountry
from app.schemas.visited_country import VisitedCountryOut

router = APIRouter(tags=["public"])


@router.get("/travels", response_model=list[VisitedCountryOut])
def list_visited_countries(db: Session = Depends(get_db)):
    return db.query(VisitedCountry).order_by(VisitedCountry.name.asc()).all()
