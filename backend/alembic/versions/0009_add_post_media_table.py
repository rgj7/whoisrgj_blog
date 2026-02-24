"""add post_media table

Revision ID: 0009_add_post_media
Revises: 6aad2605741b
Create Date: 2026-02-23 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0009_add_post_media"
down_revision: str | None = "0008_add_site_profile"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "post_media",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "post_id",
            sa.Integer(),
            sa.ForeignKey("posts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("media_type", sa.String(50), nullable=False),
        sa.Column("external_id", sa.String(255), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_post_media_post_id", "post_media", ["post_id"])


def downgrade() -> None:
    op.drop_index("ix_post_media_post_id", table_name="post_media")
    op.drop_table("post_media")
