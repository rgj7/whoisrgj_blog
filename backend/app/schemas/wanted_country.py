from pydantic import BaseModel


class WantedCountryOut(BaseModel):
    id: int
    name: str
    iso_numeric: int

    model_config = {"from_attributes": True}


class WantedCountryCreate(BaseModel):
    name: str
    iso_numeric: int
