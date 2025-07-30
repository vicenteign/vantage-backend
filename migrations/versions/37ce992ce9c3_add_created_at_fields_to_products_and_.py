"""add_created_at_fields_to_products_and_services

Revision ID: 37ce992ce9c3
Revises: d7816f0dbabd
Create Date: 2025-07-29 22:19:05.970020

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '37ce992ce9c3'
down_revision = 'd7816f0dbabd'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar campos de timestamp a la tabla products
    op.add_column('products', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('products', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # Agregar campos de timestamp a la tabla services
    op.add_column('services', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('services', sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remover campos de timestamp de la tabla products
    op.drop_column('products', 'created_at')
    op.drop_column('products', 'updated_at')
    
    # Remover campos de timestamp de la tabla services
    op.drop_column('services', 'created_at')
    op.drop_column('services', 'updated_at')
