"""add custom_label and custom_url to nav_links

Revision ID: 0007_nav_links_custom
Revises: 6aad2605741b
Create Date: 2026-02-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0007_nav_links_custom'
down_revision: Union[str, None] = '6aad2605741b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('nav_links', sa.Column('custom_label', sa.String(), nullable=True))
    op.add_column('nav_links', sa.Column('custom_url', sa.String(), nullable=True))
    op.alter_column('nav_links', 'page_id', nullable=True)


def downgrade() -> None:
    op.alter_column('nav_links', 'page_id', nullable=False)
    op.drop_column('nav_links', 'custom_url')
    op.drop_column('nav_links', 'custom_label')
