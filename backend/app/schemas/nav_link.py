from typing import Optional
from pydantic import BaseModel, model_validator
from app.schemas.page import PageSummary


class NavLinkOut(BaseModel):
    id: int
    page_id: Optional[int]
    position: int
    page: Optional[PageSummary]
    custom_label: Optional[str]
    custom_url: Optional[str]

    model_config = {"from_attributes": True}


class NavLinkAdd(BaseModel):
    page_id: Optional[int] = None
    custom_label: Optional[str] = None
    custom_url: Optional[str] = None

    @model_validator(mode="after")
    def check_link_type(self):
        has_page = self.page_id is not None
        has_custom = self.custom_label is not None and self.custom_url is not None
        if not has_page and not has_custom:
            raise ValueError("Provide either page_id or both custom_label and custom_url")
        if has_page and has_custom:
            raise ValueError("Provide either page_id or custom_label/custom_url, not both")
        return self


class NavLinkReorder(BaseModel):
    ordered_ids: list[int]
