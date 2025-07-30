from flask import Flask
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config
from .models import db

# Inicializar extensiones fuera de la función para poder importarlas en los blueprints
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar extensiones con la app
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate = Migrate(app, db)

    # Configuración de CORS más flexible para EC2
    cors_origins = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:5002", 
        "http://127.0.0.1:5002",
        "https://5a218fd5abba.ngrok-free.app",
        "https://*.ngrok-free.app",  # Permitir cualquier subdominio de ngrok
        "http://*.amazonaws.com",    # Permitir dominios de AWS
        "https://*.amazonaws.com",   # Permitir dominios de AWS con HTTPS
        "http://*.compute.amazonaws.com",  # EC2 específico
        "https://*.compute.amazonaws.com", # EC2 específico con HTTPS
        "http://3.141.40.201:3000",  # Tu IP específica de EC2
        "http://3.141.40.201:5002",  # Tu IP específica de EC2
        "https://3.141.40.201:3000", # Tu IP específica de EC2 con HTTPS
        "https://3.141.40.201:5002", # Tu IP específica de EC2 con HTTPS
    ]
    
    # Agregar IP pública de EC2 si está disponible en variables de entorno
    import os
    ec2_public_ip = os.environ.get('EC2_PUBLIC_IP')
    if ec2_public_ip:
        cors_origins.extend([
            f"http://{ec2_public_ip}",
            f"http://{ec2_public_ip}:3000",
            f"http://{ec2_public_ip}:5002",
            f"https://{ec2_public_ip}",
            f"https://{ec2_public_ip}:3000",
            f"https://{ec2_public_ip}:5002",
        ])

    # Configuración CORS más permisiva para desarrollo/producción
    CORS(app, 
         origins=cors_origins, 
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"])

    # Importar y registrar Blueprints
    from .routes import main_bp
    from .auth_bp import auth_bp
    from .api_bp import api_bp
    from .provider_bp import provider_bp
    from .catalog_bp import catalog_bp
    from .client_bp import client_bp
    from .quotes_bp import quotes_bp
    from .upload_bp import upload_bp
    from .notifications_bp import notifications_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(provider_bp)
    app.register_blueprint(catalog_bp)
    app.register_blueprint(client_bp)
    app.register_blueprint(quotes_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(notifications_bp)

    return app 