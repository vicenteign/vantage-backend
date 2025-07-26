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

    # Habilitar CORS para todas las rutas desde localhost:3000 y ngrok
    CORS(app, origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:5002", 
        "http://127.0.0.1:5002",
        "https://5a218fd5abba.ngrok-free.app",
        "https://*.ngrok-free.app"  # Permitir cualquier subdominio de ngrok
    ], supports_credentials=True)

    # Importar y registrar Blueprints
    from .auth_bp import auth_bp
    from .provider_bp import provider_bp
    from .catalog_bp import catalog_bp
    from .client_bp import client_bp
    from .quotes_bp import quotes_bp
    from .upload_bp import upload_bp
    from .notifications_bp import notifications_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(provider_bp)
    app.register_blueprint(catalog_bp)
    app.register_blueprint(client_bp)
    app.register_blueprint(quotes_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(notifications_bp)

    return app 