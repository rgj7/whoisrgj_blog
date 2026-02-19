from pydantic import BaseModel
from app.schemas.page import PageSummary


class NavLinkOut(BaseModel):
    id: int
    page_id: int
    position: int
    page: PageSummary

    model_config = {"from_attributes": True}


class NavLinkAdd(BaseModel):
    page_id: int


class NavLinkReorder(BaseModel):
    ordered_ids: list[int]
