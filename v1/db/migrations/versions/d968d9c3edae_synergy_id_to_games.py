"""synergy id to games

Revision ID: d968d9c3edae
Revises: 3f68c89bfeaf
Create Date: 2025-02-24 14:48:40.885241

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd968d9c3edae'
down_revision = '3f68c89bfeaf'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('games', sa.Column('synergy_id', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('games', 'synergy_id')
    # ### end Alembic commands ### 