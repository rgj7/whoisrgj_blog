from pydantic import BaseModel


class VisitedCountryOut(BaseModel):
    id: int
    name: str
    iso_numeric: int

    model_config = {"from_attributes": True}


class VisitedCountryCreate(BaseModel):
    name: str
    iso_numeric: int
