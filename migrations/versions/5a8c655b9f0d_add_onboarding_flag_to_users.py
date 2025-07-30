"""add_onboarding_flag_to_users

Revision ID: 5a8c655b9f0d
Revises: 37ce992ce9c3
Create Date: 2025-07-29 22:22:04.407762

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a8c655b9f0d'
down_revision = '37ce992ce9c3'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar columna has_completed_onboarding a la tabla users
    op.add_column('users', sa.Column('has_completed_onboarding', sa.Boolean(), nullable=True))


def downgrade():
    # Remover columna has_completed_onboarding de la tabla users
    op.drop_column('users', 'has_completed_onboarding')
