"""description

Revision ID: 393cbf2eeee3
Revises: 1b0fbd03f022
Create Date: 2025-02-26 12:29:27.085738

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '393cbf2eeee3'
down_revision = '1b0fbd03f022'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('play_by_play', sa.Column('winning_team', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('play_by_play', 'winning_team')
    # ### end Alembic commands ### 