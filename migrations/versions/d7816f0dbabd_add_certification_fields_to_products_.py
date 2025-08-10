"""add_certification_fields_to_products_and_services

Revision ID: d7816f0dbabd
Revises: add_quote_status_fields
Create Date: 2025-07-29 22:17:54.281579

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd7816f0dbabd'
down_revision = '6b4c612a2f85'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar campos a la tabla products
    op.add_column('products', sa.Column('currency', sa.String(), nullable=True))
    op.add_column('products', sa.Column('has_cert_iso9001', sa.Boolean(), nullable=True))
    op.add_column('products', sa.Column('has_cert_iso14001', sa.Boolean(), nullable=True))
    
    # Agregar campos a la tabla services
    op.add_column('services', sa.Column('duration', sa.String(), nullable=True))
    op.add_column('services', sa.Column('price', sa.Float(), nullable=True))
    op.add_column('services', sa.Column('currency', sa.String(), nullable=True))
    op.add_column('services', sa.Column('technical_details', sa.Text(), nullable=True))
    op.add_column('services', sa.Column('has_cert_iso9001', sa.Boolean(), nullable=True))
    op.add_column('services', sa.Column('has_cert_iso14001', sa.Boolean(), nullable=True))


def downgrade():
    # Remover campos de la tabla products
    op.drop_column('products', 'currency')
    op.drop_column('products', 'has_cert_iso9001')
    op.drop_column('products', 'has_cert_iso14001')
    
    # Remover campos de la tabla services
    op.drop_column('services', 'duration')
    op.drop_column('services', 'price')
    op.drop_column('services', 'currency')
    op.drop_column('services', 'technical_details')
    op.drop_column('services', 'has_cert_iso9001')
    op.drop_column('services', 'has_cert_iso14001')
