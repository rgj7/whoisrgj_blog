"""add background_image_url to post_media

Revision ID: 0010_add_post_media_image_url
Revises: 0009_add_post_media
Create Date: 2026-02-23 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0010_add_post_media_image_url"
down_revision: str | None = "0009_add_post_media"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("post_media", sa.Column("background_image_url", sa.String(2048), nullable=True))


def downgrade() -> None:
    op.drop_column("post_media", "background_image_url")
