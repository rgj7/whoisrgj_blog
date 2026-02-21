"""add site_profile table

Revision ID: 0008_add_site_profile
Revises: 0007_nav_links_custom
Create Date: 2026-02-20 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0008_add_site_profile"
down_revision: str | None = "0007_nav_links_custom"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "site_profile",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("bio", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("site_profile")
