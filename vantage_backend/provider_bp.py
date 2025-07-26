from flask import request, jsonify, Blueprint
from .models import db, ProviderProfile, Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename

provider_bp = Blueprint('provider', __name__, url_prefix='/provider')

@provider_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_provider_profile():
    try:
        user_id = get_jwt_identity()
        print(f"JWT Identity (user_id): {user_id}")
        
        user = User.query.get(int(user_id))
        print(f"User found: {user}")
        
        if not user or user.role != 'proveedor':
            print(f"User role: {user.role if user else 'None'}")
            return jsonify({"message": "Acceso no autorizado"}), 403

        profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
        print(f"Profile found: {profile}")
        
        if not profile:
            return jsonify({"message": "Perfil no encontrado"}), 404

        return jsonify({
            "company_name": profile.company_name,
            "about_us": profile.about_us,
            "website_url": profile.website_url
            # Añadir más campos según sea necesario
        })
    except Exception as e:
        print(f"Error in get_provider_profile: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500

@provider_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_provider_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403
    
    profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
    if not profile:
        return jsonify({"message": "Perfil no encontrado"}), 404

    data = request.get_json()
    profile.about_us = data.get('about_us', profile.about_us)
    profile.website_url = data.get('website_url', profile.website_url)
    # Actualizar más campos...
    
    db.session.commit()
    return jsonify({"message": "Perfil actualizado exitosamente"})

@provider_bp.route('/profile/logo', methods=['PUT'])
@jwt_required()
def upload_logo():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    if 'logo' not in request.files:
        return jsonify({"message": "No se encontró el archivo"}), 400

    file = request.files['logo']
    if file.filename == '':
        return jsonify({"message": "No se seleccionó ningún archivo"}), 400

    if file:
        filename = secure_filename(file.filename)
        # Define la ruta de guardado (asegúrate que la carpeta 'uploads' exista)
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # Guarda la ruta del archivo en el perfil del proveedor
        profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
        profile.logo_url = file_path
        db.session.commit()

        return jsonify({"message": "Logo subido exitosamente", "path": file_path})

    return jsonify({"message": "Error al subir el archivo"}), 500 