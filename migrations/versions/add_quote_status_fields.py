"""add quote status fields

Revision ID: add_quote_status_fields
Revises: 92599cce2f7f
Create Date: 2025-01-26 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_quote_status_fields'
down_revision = '92599cce2f7f'
branch_labels = None
depends_on = None


def upgrade():
    # Crear el enum para los estados de cotización
    op.execute("CREATE TYPE quote_statuses AS ENUM ('pendiente', 'respondida', 'cancelada')")
    
    # Agregar la columna status con valor por defecto 'pendiente'
    op.add_column('quote_requests', sa.Column('status', sa.Enum('pendiente', 'respondida', 'cancelada', name='quote_statuses'), nullable=False, server_default='pendiente'))
    
    # Agregar la columna responded_at
    op.add_column('quote_requests', sa.Column('responded_at', sa.DateTime(), nullable=True))


def downgrade():
    # Eliminar las columnas
    op.drop_column('quote_requests', 'responded_at')
    op.drop_column('quote_requests', 'status')
    
    # Eliminar el enum
    op.execute("DROP TYPE quote_statuses") 