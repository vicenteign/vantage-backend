from flask import request, jsonify, Blueprint
from .models import db, User, ProviderProfile
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
bcrypt = Bcrypt()

@auth_bp.route('/register/provider', methods=['POST'])
def register_provider():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    company_name = data.get('company_name')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "El email ya está registrado"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(
        email=email,
        password_hash=hashed_password,
        full_name=full_name,
        role='proveedor'
    )
    db.session.add(new_user)
    db.session.commit()

    new_provider_profile = ProviderProfile(
        user_id=new_user.id,
        company_name=company_name
    )
    db.session.add(new_provider_profile)
    db.session.commit()

    return jsonify({"message": "Proveedor registrado exitosamente"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
            }
        })

    return jsonify({"message": "Credenciales inválidas"}), 401 