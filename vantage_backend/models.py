from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from datetime import datetime

# Configuración para que Alembic detecte nombres de constraints automáticamente
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)

# --- GRUPO: USUARIOS Y PERFILES ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    full_name = db.Column(db.String)
    role = db.Column(db.Enum('proveedor', 'cliente', 'administrador', name='user_roles'), nullable=False)
    status = db.Column(db.Enum('activo', 'suspendido', name='user_statuses'), default='activo')
    company_id = db.Column(db.Integer, db.ForeignKey('client_companies.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('client_branches.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProviderProfile(db.Model):
    __tablename__ = 'providers_profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    company_name = db.Column(db.String)
    about_us = db.Column(db.Text)
    logo_url = db.Column(db.String)
    brochure_pdf_url = db.Column(db.String)
    website_url = db.Column(db.String)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'))
    user = db.relationship('User', backref=db.backref('provider_profile', uselist=False))
    contacts = db.relationship('ProviderContact', backref='provider', lazy=True)
    products = db.relationship('Product', backref='provider', lazy=True)
    services = db.relationship('Service', backref='provider', lazy=True)
    certifications = db.relationship('ProviderCertification', backref='provider', lazy=True)

class ClientCompany(db.Model):
    __tablename__ = 'client_companies'
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String)
    logo_url = db.Column(db.String)
    about_us = db.Column(db.Text)
    website_url = db.Column(db.String)
    industry = db.Column(db.String)
    users = db.relationship('User', backref='company', lazy=True)
    branches = db.relationship('ClientBranch', backref='company', lazy=True)

class ClientBranch(db.Model):
    __tablename__ = 'client_branches'
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('client_companies.id'), nullable=False)
    branch_name = db.Column(db.String)
    address = db.Column(db.String)
    contact_phone = db.Column(db.String)
    users = db.relationship('User', backref='branch', lazy=True)

class ProviderContact(db.Model):
    __tablename__ = 'provider_contacts'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers_profile.id'), nullable=False)
    name = db.Column(db.String)
    email = db.Column(db.String)
    phone = db.Column(db.String)
    position = db.Column(db.String)
    is_primary = db.Column(db.Boolean, default=False)

# --- GRUPO: CATÁLOGO ---
class Plan(db.Model):
    __tablename__ = 'plans'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    product_limit = db.Column(db.Integer)
    service_limit = db.Column(db.Integer)
    providers = db.relationship('ProviderProfile', backref='plan', lazy=True)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    parent = db.relationship('Category', remote_side=[id], backref='subcategories')

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers_profile.id'), nullable=False)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    technical_details = db.Column(db.Text)
    sku = db.Column(db.String)
    price = db.Column(db.Float, nullable=True)  # Precio del producto
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    status = db.Column(db.Enum('borrador', 'activo', 'inactivo', name='product_statuses'), default='borrador')
    is_featured = db.Column(db.Boolean, default=False)
    main_image_url = db.Column(db.String)  # Imagen principal del producto
    additional_images = db.Column(db.JSON)  # Array de URLs de imágenes adicionales
    category = db.relationship('Category', backref='products')

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers_profile.id'), nullable=False)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    modality = db.Column(db.String)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    status = db.Column(db.Enum('borrador', 'activo', 'inactivo', name='service_statuses'), default='borrador')
    is_featured = db.Column(db.Boolean, default=False)
    category = db.relationship('Category', backref='services')

class ProviderCertification(db.Model):
    __tablename__ = 'provider_certifications'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers_profile.id'), nullable=False)
    name = db.Column(db.String)
    file_url = db.Column(db.String)
    expiry_date = db.Column(db.Date, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

# --- GRUPO: INTERACCIONES Y CONTENIDO ---
class QuoteRequest(db.Model):
    __tablename__ = 'quote_requests'
    id = db.Column(db.Integer, primary_key=True)
    client_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    client_branch_id = db.Column(db.Integer, db.ForeignKey('client_branches.id'), nullable=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers_profile.id'), nullable=False)
    item_id = db.Column(db.Integer, nullable=False)
    item_type = db.Column(db.Enum('producto', 'servicio', name='item_types'), nullable=False)
    item_name_snapshot = db.Column(db.String)
    quantity = db.Column(db.Integer, nullable=True)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('pendiente', 'respondida', 'cancelada', name='quote_statuses'), default='pendiente')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime, nullable=True)
    client = db.relationship('User', backref='sent_quotes')
    provider = db.relationship('ProviderProfile', backref='received_quotes')

class QuoteAttachment(db.Model):
    __tablename__ = 'quote_attachments'
    id = db.Column(db.Integer, primary_key=True)
    quote_request_id = db.Column(db.Integer, db.ForeignKey('quote_requests.id'), nullable=False)
    file_url = db.Column(db.String)
    original_filename = db.Column(db.String)
    quote_request = db.relationship('QuoteRequest', backref='attachments')

# --- RESPUESTAS DE COTIZACIÓN ---
class QuoteResponse(db.Model):
    __tablename__ = 'quote_responses'
    id = db.Column(db.Integer, primary_key=True)
    quote_request_id = db.Column(db.Integer, db.ForeignKey('quote_requests.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers_profile.id'), nullable=False)
    response_pdf_url = db.Column(db.String, nullable=False)
    total_price = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String, nullable=True)
    certifications_count = db.Column(db.Integer, nullable=True)
    ia_data = db.Column(db.JSON, nullable=True)  # Datos extraídos por IA
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    quote_request = db.relationship('QuoteRequest', backref='responses')
    provider = db.relationship('ProviderProfile', backref='quote_responses')

# --- GRUPO: NOTIFICACIONES ---
class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('quote_request', 'quote_response', 'system', name='notification_types'), nullable=False)
    title = db.Column(db.String, nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    data = db.Column(db.JSON)  # Datos adicionales en formato JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    recipient = db.relationship('User', backref='notifications') 