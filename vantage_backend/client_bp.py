from flask import request, jsonify, Blueprint
from .models import db, User, ClientCompany, ClientBranch
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename

client_bp = Blueprint('client', __name__, url_prefix='/client')
bcrypt = Bcrypt()

@client_bp.route('/register', methods=['POST'])
def register_client():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    company_name = data.get('company_name')
    industry = data.get('industry')
    company_size = data.get('company_size')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "El email ya está registrado"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Crear o encontrar la empresa
    company = ClientCompany.query.filter_by(company_name=company_name).first()
    if not company:
        company = ClientCompany(
            company_name=company_name,
            industry=industry
        )
        db.session.add(company)
        db.session.flush()  # Para obtener el ID de la empresa
    
    # Crear el usuario
    new_user = User(
        email=email,
        password_hash=hashed_password,
        full_name=full_name,
        role='cliente',
        company_id=company.id
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Cliente registrado exitosamente"}), 201

@client_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_client_profile():
    try:
        user_id = get_jwt_identity()
        print(f"JWT Identity (user_id): {user_id}")
        
        # Convert string user_id to integer for database query
        user = User.query.get(int(user_id))
        print(f"User found: {user}")
        
        if not user or user.role != 'cliente':
            print(f"User role: {user.role if user else 'None'}")
            return jsonify({"message": "Acceso no autorizado"}), 403

        company = ClientCompany.query.get(user.company_id) if user.company_id else None
        branch = ClientBranch.query.get(user.branch_id) if user.branch_id else None
        print(f"Company found: {company}")
        print(f"Branch found: {branch}")
        
        return jsonify({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "company": {
                "id": company.id,
                "company_name": company.company_name,
                "industry": company.industry,
                "about_us": company.about_us,
                "website_url": company.website_url,
                "logo_url": company.logo_url
            } if company else None,
            "branch": {
                "id": branch.id,
                "branch_name": branch.branch_name,
                "address": branch.address,
                "contact_phone": branch.contact_phone
            } if branch else None
        })
    except Exception as e:
        print(f"Error in get_client_profile: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500

@client_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_client_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'cliente':
        return jsonify({"message": "Acceso no autorizado"}), 403
    
    company = ClientCompany.query.get(user.company_id)
    if not company:
        return jsonify({"message": "Empresa no encontrada"}), 404

    data = request.get_json()
    
    # Actualizar datos del usuario
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    # Actualizar datos de la empresa
    if 'company_name' in data:
        company.company_name = data['company_name']
    if 'industry' in data:
        company.industry = data['industry']
    if 'about_us' in data:
        company.about_us = data['about_us']
    if 'website_url' in data:
        company.website_url = data['website_url']
    
    db.session.commit()
    return jsonify({"message": "Perfil actualizado exitosamente"})

@client_bp.route('/profile/logo', methods=['PUT'])
@jwt_required()
def upload_client_logo():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'cliente':
        return jsonify({"message": "Acceso no autorizado"}), 403

    company = ClientCompany.query.get(user.company_id)
    if not company:
        return jsonify({"message": "Empresa no encontrada"}), 404

    if 'logo' not in request.files:
        return jsonify({"message": "No se encontró el archivo"}), 400

    file = request.files['logo']
    if file.filename == '':
        return jsonify({"message": "No se seleccionó ningún archivo"}), 400

    if file:
        filename = secure_filename(file.filename)
        # Define la ruta de guardado
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)

        # Guarda la ruta del archivo en el perfil de la empresa
        company.logo_url = file_path
        db.session.commit()

        return jsonify({"message": "Logo subido exitosamente", "path": file_path})

    return jsonify({"message": "Error al subir el archivo"}), 500

@client_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_client_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'cliente':
        return jsonify({"message": "Acceso no autorizado"}), 403

    try:
        # Importar modelos necesarios
        from .models import QuoteRequest, QuoteResponse
        
        print(f"[DASHBOARD] Usuario ID: {user_id}")
        print(f"[DASHBOARD] Usuario: {user.full_name} ({user.email})")
        
        # Obtener cotizaciones del cliente
        total_quotes = QuoteRequest.query.filter_by(client_user_id=user_id).count()
        print(f"[DASHBOARD] Total cotizaciones encontradas: {total_quotes}")
        
        # Obtener cotizaciones pendientes (sin respuestas)
        pending_quotes = 0
        client_quotes = QuoteRequest.query.filter_by(client_user_id=user_id).all()
        print(f"[DASHBOARD] Cotizaciones del cliente: {len(client_quotes)}")
        
        for quote in client_quotes:
            responses = QuoteResponse.query.filter_by(quote_request_id=quote.id).count()
            print(f"[DASHBOARD] Cotización {quote.id}: {responses} respuestas")
            if responses == 0:
                pending_quotes += 1
        
        # Obtener cotizaciones con respuestas
        quotes_with_responses = total_quotes - pending_quotes
        
        # Obtener nombre de la empresa
        company_name = user.company.company_name if user.company else "Mi Empresa"
        
        # Obtener cotizaciones recientes (últimas 5)
        recent_quotes = QuoteRequest.query.filter_by(client_user_id=user_id)\
            .order_by(QuoteRequest.created_at.desc())\
            .limit(5)\
            .all()
        
        recent_quotes_data = []
        for quote in recent_quotes:
            responses_count = QuoteResponse.query.filter_by(quote_request_id=quote.id).count()
            recent_quotes_data.append({
                "id": quote.id,
                "item_name": quote.item_name_snapshot,
                "item_type": quote.item_type,
                "status": "respondida" if responses_count > 0 else "pendiente",
                "created_at": quote.created_at.isoformat(),
                "responses_count": responses_count
            })

        stats = {
            "total_quotes_sent": total_quotes,
            "pending_quotes": pending_quotes,
            "quotes_with_responses": quotes_with_responses,
            "company_name": company_name,
            "recent_quotes": recent_quotes_data
        }

        print(f"[DASHBOARD] Stats finales: {stats}")
        return jsonify(stats)
        
    except Exception as e:
        print(f"Error en dashboard: {e}")
        # Fallback con datos básicos
        stats = {
            "total_quotes_sent": 0,
            "pending_quotes": 0,
            "quotes_with_responses": 0,
            "company_name": user.company.company_name if user.company else "Mi Empresa",
            "recent_quotes": []
        }
        return jsonify(stats) 