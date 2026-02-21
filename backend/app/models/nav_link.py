from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.page import Page


class NavLink(Base):
    __tablename__ = "nav_links"
    __table_args__ = (UniqueConstraint("page_id", name="uq_nav_links_page_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    page_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=True)
    custom_label: Mapped[str | None] = mapped_column(String, nullable=True)
    custom_url: Mapped[str | None] = mapped_column(String, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    page: Mapped[Page | None] = relationship("Page", lazy="joined")
