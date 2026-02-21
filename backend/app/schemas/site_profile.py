from typing import Optional
from pydantic import BaseModel


class SiteProfileOut(BaseModel):
    photo_url: Optional[str] = None
    bio: Optional[str] = None

    model_config = {"from_attributes": True}


class SiteProfileUpdate(BaseModel):
    photo_url: Optional[str] = None
    bio: Optional[str] = None
