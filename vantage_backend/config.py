import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

class Config:
    """Clase de configuración base."""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'tu-clave-secreta-super-segura-para-jwt-2024')
    JWT_ACCESS_TOKEN_EXPIRES = False  # Los tokens no expiran por defecto para desarrollo 