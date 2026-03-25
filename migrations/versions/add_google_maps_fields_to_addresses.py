"""Add Google Maps fields (lat, lng, maps_url) to addresses

Revision ID: a1b2c3d4e5f6
Revises: 47939b791143
Create Date: 2026-03-23 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '47939b791143'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('addresses', sa.Column('lat', sa.Float(), nullable=True))
    op.add_column('addresses', sa.Column('lng', sa.Float(), nullable=True))
    op.add_column('addresses', sa.Column('maps_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('addresses', 'maps_url')
    op.drop_column('addresses', 'lng')
    op.drop_column('addresses', 'lat')
