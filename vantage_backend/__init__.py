from flask import Flask, request
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

    # Configuración de CORS usando variables de entorno
    import os
    
    # Obtener CORS_ORIGINS de las variables de entorno
    cors_origins_env = os.environ.get('CORS_ORIGINS', 'http://localhost:3000')
    cors_origins = [origin.strip() for origin in cors_origins_env.split(',')]
    
    # Agregar dominios adicionales para desarrollo y producción
    additional_origins = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3001", 
        "http://localhost:5002", 
        "http://127.0.0.1:5002",
        "https://*.amplifyapp.com",    # Amplify domains
        "https://*.amplify.aws",       # Amplify AWS domains
        "https://*.amazonaws.com",     # AWS domains
        "http://*.amazonaws.com",      # AWS domains HTTP
        "https://*.compute.amazonaws.com", # EC2 domains
        "http://*.compute.amazonaws.com",  # EC2 domains HTTP
    ]
    
    # Combinar orígenes de entorno con adicionales
    all_origins = list(set(cors_origins + additional_origins))
    
    print(f"🌐 CORS Origins configurados: {all_origins}")

    # Configuración CORS más permisiva para desarrollo/producción
    CORS(app, 
         origins=all_origins, 
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         expose_headers=["Content-Type", "Authorization"],
         max_age=86400)

    # Respuesta global para preflights (OPTIONS) con cabeceras CORS explícitas
    @app.before_request
    def handle_global_options_preflight():
        if request.method == 'OPTIONS':
            origin = request.headers.get('Origin', '*')
            response = app.make_response(('', 204))
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Vary'] = 'Origin'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            # Incluir ambos casos para evitar problemas de case en algunos navegadores
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, authorization, X-Requested-With'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

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