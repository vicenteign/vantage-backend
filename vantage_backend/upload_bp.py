import os
import uuid
from flask import request, jsonify, Blueprint, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, User, ProviderProfile
import mimetypes

upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

# Configuración de archivos permitidos
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """Determina el tipo de archivo basado en la extensión"""
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp']:
        return 'image'
    elif ext in ['pdf']:
        return 'document'
    else:
        return 'other'

@upload_bp.route('/product-image', methods=['POST'])
@jwt_required()
def upload_product_image():
    """Endpoint para subir imágenes de productos"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    # Verificar que se envió un archivo
    if 'file' not in request.files:
        return jsonify({"message": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No se seleccionó ningún archivo"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"message": "Tipo de archivo no permitido"}), 400
    
    # Verificar tamaño del archivo
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({"message": "El archivo es demasiado grande. Máximo 10MB"}), 400
    
    # Generar nombre único para el archivo
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    
    # Crear directorio si no existe
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'products')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Guardar archivo
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    
    # Generar URL relativa
    file_url = f"/static/uploads/products/{unique_filename}"
    
    return jsonify({
        "message": "Archivo subido exitosamente",
        "file_url": file_url,
        "filename": filename,
        "file_type": get_file_type(filename)
    }), 201

@upload_bp.route('/service-image', methods=['POST'])
@jwt_required()
def upload_service_image():
    """Endpoint para subir imágenes de servicios"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    # Verificar que se envió un archivo
    if 'file' not in request.files:
        return jsonify({"message": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No se seleccionó ningún archivo"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"message": "Tipo de archivo no permitido"}), 400
    
    # Verificar tamaño del archivo
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({"message": "El archivo es demasiado grande. Máximo 10MB"}), 400
    
    # Generar nombre único para el archivo
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    
    # Crear directorio si no existe
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'services')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Guardar archivo
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    
    # Generar URL relativa
    file_url = f"/static/uploads/services/{unique_filename}"
    
    return jsonify({
        "message": "Archivo subido exitosamente",
        "file_url": file_url,
        "filename": filename,
        "file_type": get_file_type(filename)
    }), 201

@upload_bp.route('/provider-logo', methods=['POST'])
@jwt_required()
def upload_provider_logo():
    """Endpoint para subir logo del proveedor"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    # Verificar que se envió un archivo
    if 'file' not in request.files:
        return jsonify({"message": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No se seleccionó ningún archivo"}), 400
    
    # Solo permitir imágenes para logos
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
        return jsonify({"message": "Solo se permiten archivos de imagen para logos"}), 400
    
    # Verificar tamaño del archivo
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({"message": "El archivo es demasiado grande. Máximo 10MB"}), 400
    
    # Generar nombre único para el archivo
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"logo_{uuid.uuid4().hex}.{file_extension}"
    
    # Crear directorio si no existe
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'providers')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Guardar archivo
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    
    # Generar URL relativa
    file_url = f"/static/uploads/providers/{unique_filename}"
    
    return jsonify({
        "message": "Logo subido exitosamente",
        "file_url": file_url,
        "filename": filename
    }), 201

@upload_bp.route('/certification', methods=['POST'])
@jwt_required()
def upload_certification():
    """Endpoint para subir certificaciones del proveedor"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    # Verificar que se envió un archivo
    if 'file' not in request.files:
        return jsonify({"message": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"message": "No se seleccionó ningún archivo"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"message": "Tipo de archivo no permitido"}), 400
    
    # Verificar tamaño del archivo
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({"message": "El archivo es demasiado grande. Máximo 10MB"}), 400
    
    # Generar nombre único para el archivo
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"cert_{uuid.uuid4().hex}.{file_extension}"
    
    # Crear directorio si no existe
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'certifications')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Guardar archivo
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    
    # Generar URL relativa
    file_url = f"/static/uploads/certifications/{unique_filename}"
    
    return jsonify({
        "message": "Certificación subida exitosamente",
        "file_url": file_url,
        "filename": filename,
        "file_type": get_file_type(filename)
    }), 201 