from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.post import Post


class PostMedia(Base):
    __tablename__ = "post_media"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    media_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'game' | 'movie' | 'tv'
    external_id: Mapped[str] = mapped_column(String(255), nullable=False)  # RAWG id, TMDB id, etc.
    title: Mapped[str] = mapped_column(String(500), nullable=False)  # denormalized display name

    post: Mapped[Post] = relationship("Post", back_populates="media")
