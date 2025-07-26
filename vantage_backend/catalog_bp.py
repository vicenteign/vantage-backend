from flask import request, jsonify, Blueprint
from .models import db, Product, Service, ProviderProfile, User, Category, ProviderContact, ProviderCertification
from flask_jwt_extended import jwt_required, get_jwt_identity

catalog_bp = Blueprint('catalog', __name__, url_prefix='/catalog')

# --- Product Endpoints ---

@catalog_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    provider_profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
    data = request.get_json()

    new_product = Product(
        provider_id=provider_profile.id,
        name=data.get('name'),
        description=data.get('description'),
        technical_details=data.get('technical_details'),
        sku=data.get('sku'),
        status=data.get('status', 'borrador'),
        main_image_url=data.get('main_image_url'),
        additional_images=data.get('additional_images', [])
    )
    db.session.add(new_product)
    db.session.commit()

    return jsonify({"message": "Producto creado", "product_id": new_product.id}), 201

@catalog_bp.route('/products', methods=['GET'])
@jwt_required()
def get_my_products():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403
    provider_profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
    products = Product.query.filter_by(provider_id=provider_profile.id).all()
    
    output = [{"id": p.id, "name": p.name, "sku": p.sku, "status": p.status} for p in products]
    return jsonify(products=output)

@catalog_bp.route('/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_product(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403
    provider_profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
    
    product = Product.query.filter_by(id=product_id, provider_id=provider_profile.id).first_or_404()

    if request.method == 'GET':
        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "technical_details": product.technical_details,
            "sku": product.sku,
            "status": product.status
        })

    if request.method == 'PUT':
        data = request.get_json()
        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)
        # ... actualizar otros campos
        db.session.commit()
        return jsonify({"message": "Producto actualizado"})

    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Producto eliminado"})

# --- Service Endpoints ---

@catalog_bp.route('/services', methods=['POST'])
@jwt_required()
def create_service():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403

    provider_profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
    data = request.get_json()

    new_service = Service(
        provider_id=provider_profile.id,
        name=data.get('name'),
        description=data.get('description'),
        modality=data.get('modality'),
        status=data.get('status', 'borrador')
    )
    
    db.session.add(new_service)
    db.session.commit()
    
    return jsonify({"message": "Servicio creado exitosamente"}), 201

@catalog_bp.route('/services', methods=['GET'])
@jwt_required()
def get_my_services():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'proveedor':
            return jsonify({"message": "Acceso no autorizado"}), 403
        
        provider_profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
        if not provider_profile:
            return jsonify({"message": "Perfil de proveedor no encontrado"}), 404
        
        services = Service.query.filter_by(provider_id=provider_profile.id).all()
        
        services_list = []
        for service in services:
            services_list.append({
                "id": service.id,
                "name": service.name,
                "description": service.description,
                "modality": service.modality,
                "status": service.status,
                "is_featured": service.is_featured
            })
        
        return jsonify({"services": services_list})
    except Exception as e:
        print(f"Error in get_my_services: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500

@catalog_bp.route('/services/<int:service_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_service(service_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'proveedor':
        return jsonify({"message": "Acceso no autorizado"}), 403
    provider_profile = ProviderProfile.query.filter_by(user_id=int(user_id)).first()
    
    service = Service.query.filter_by(id=service_id, provider_id=provider_profile.id).first_or_404()
    
    if request.method == 'GET':
        return jsonify({
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "modality": service.modality,
            "status": service.status,
            "is_featured": service.is_featured
        })
    
    elif request.method == 'PUT':
        data = request.get_json()
        service.name = data.get('name', service.name)
        service.description = data.get('description', service.description)
        service.modality = data.get('modality', service.modality)
        service.status = data.get('status', service.status)
        service.is_featured = data.get('is_featured', service.is_featured)
        
        db.session.commit()
        return jsonify({"message": "Servicio actualizado exitosamente"})
    
    elif request.method == 'DELETE':
        db.session.delete(service)
        db.session.commit()
        return jsonify({"message": "Servicio eliminado exitosamente"})

# --- Public Catalog Endpoints ---

@catalog_bp.route('/public/products', methods=['GET'])
def get_public_products():
    "point público para obtener productos activos con búsqueda, filtros y paginación"""
    # Obtener parámetros de consulta
    search = request.args.get('search', '').strip()
    category_id = request.args.get('category_id', type=int)
    provider_id = request.args.get('provider_id', type=int)
    sort_by = request.args.get('sort_by', 'name')  # name, provider, category, created_at, price
    sort_order = request.args.get('sort_order', 'asc')  # asc, desc
    
    # Parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)  # 12 productos por página por defecto
    
    # Validar parámetros de paginación
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 50:  # Máximo 50 productos por página
        per_page = 12 
    # Query base
    query = Product.query.filter_by(status='activo')
    
    # Aplicar filtros de búsqueda avanzada
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.technical_details.ilike(search_term)
            )
        )
    
    # Filtros múltiples
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if provider_id:
        query = query.filter_by(provider_id=provider_id)
    
    # Filtros adicionales
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    is_featured = request.args.get('is_featured', type=lambda v: v.lower() == 'true') 
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    if is_featured is not None:
        query = query.filter_by(is_featured=is_featured)
    
    # Aplicar ordenamiento
    if sort_by == 'name':     query = query.order_by(Product.name.asc() if sort_order == 'asc' else Product.name.desc())
    elif sort_by == 'provider':     query = query.join(ProviderProfile).order_by(
            ProviderProfile.company_name.asc() if sort_order == 'asc' else ProviderProfile.company_name.desc()
        )
    elif sort_by == 'category':     query = query.join(Category).order_by(
            Category.name.asc() if sort_order == 'asc' else Category.name.desc()
        )
    elif sort_by == 'created_at':     query = query.order_by(Product.created_at.asc() if sort_order == 'asc' else Product.created_at.desc())
    elif sort_by == 'price':     query = query.order_by(Product.price.asc() if sort_order == 'asc' else Product.price.desc())
    else:
        query = query.order_by(Product.name.asc())
    
    # Aplicar paginación
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    products_list = []
    for product in pagination.items:
        provider = ProviderProfile.query.get(product.provider_id)
        category = Category.query.get(product.category_id)
        
        products_list.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "technical_details": product.technical_details,
            "sku": product.sku,
            "status": product.status,
            "main_image_url": product.main_image_url,
            "additional_images": product.additional_images or [],
            "price": getattr(product, 'price', None),
            "is_featured": getattr(product, 'is_featured', False),
            "created_at": product.created_at.isoformat() if hasattr(product, 'created_at') and product.created_at else None,
            "provider": {
                "id": provider.id,
                "company_name": provider.company_name
            } if provider else None,
            "category": {
                "id": category.id,
                "name": category.name
            } if category else None
        })
    
    # Información de paginación
    pagination_info = {
        "current_page": page,
        "per_page": per_page,
        "total_items": pagination.total,
        "total_pages": pagination.pages,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
        "next_page": pagination.next_num if pagination.has_next else None,
        "prev_page": pagination.prev_num if pagination.has_prev else None
    }
    
    return jsonify({
        "products": products_list,
        "pagination": pagination_info
    })

@catalog_bp.route('/public/services', methods=['GET'])
def get_public_services():
    """point público para obtener servicios activos con búsqueda, filtros y paginación"""
    # Obtener parámetros de consulta
    search = request.args.get('search', '').strip()
    category_id = request.args.get('category_id', type=int)
    provider_id = request.args.get('provider_id', type=int)
    modality = request.args.get('modality', '').strip()
    sort_by = request.args.get('sort_by', 'name')  # name, provider, category, modality, created_at
    sort_order = request.args.get('sort_order', 'asc')  # asc, desc
    
    # Parámetros de paginación
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)  # 12 servicios por página por defecto
    
    # Validar parámetros de paginación
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 50:  # Máximo 50 servicios por página
        per_page = 12 
    # Query base
    query = Service.query.filter_by(status='activo')
    
    # Aplicar filtros de búsqueda avanzada
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                Service.name.ilike(search_term),
                Service.description.ilike(search_term)
            )
        )
    
    # Filtros múltiples
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if provider_id:
        query = query.filter_by(provider_id=provider_id)
    
    if modality:
        query = query.filter_by(modality=modality)
    
    # Filtros adicionales
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    is_featured = request.args.get('is_featured', type=lambda v: v.lower() == 'true') 
    if min_price is not None:
        query = query.filter(Service.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Service.price <= max_price)
    
    if is_featured is not None:
        query = query.filter_by(is_featured=is_featured)
    
    # Aplicar ordenamiento
    if sort_by == 'name':     query = query.order_by(Service.name.asc() if sort_order == 'asc' else Service.name.desc())
    elif sort_by == 'provider':     query = query.join(ProviderProfile).order_by(
            ProviderProfile.company_name.asc() if sort_order == 'asc' else ProviderProfile.company_name.desc()
        )
    elif sort_by == 'category':     query = query.join(Category).order_by(
            Category.name.asc() if sort_order == 'asc' else Category.name.desc()
        )
    elif sort_by == 'modality':     query = query.order_by(Service.modality.asc() if sort_order == 'asc' else Service.modality.desc())
    elif sort_by == 'created_at':     query = query.order_by(Service.created_at.asc() if sort_order == 'asc' else Service.created_at.desc())
    elif sort_by == 'price':     query = query.order_by(Service.price.asc() if sort_order == 'asc' else Service.price.desc())
    else:
        query = query.order_by(Service.name.asc())
    
    # Aplicar paginación
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    services_list = []
    for service in pagination.items:
        provider = ProviderProfile.query.get(service.provider_id)
        category = Category.query.get(service.category_id)
        
        services_list.append({
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "modality": service.modality,
            "status": service.status,
            "price": getattr(service, 'price', None),
            "is_featured": getattr(service, 'is_featured', False),
            "created_at": service.created_at.isoformat() if hasattr(service, 'created_at') and service.created_at else None,
            "provider": {
                "id": provider.id,
                "company_name": provider.company_name
            } if provider else None,
            "category": {
                "id": category.id,
                "name": category.name
            } if category else None
        })
    
    # Información de paginación
    pagination_info = {
        "current_page": page,
        "per_page": per_page,
        "total_items": pagination.total,
        "total_pages": pagination.pages,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
        "next_page": pagination.next_num if pagination.has_next else None,
        "prev_page": pagination.prev_num if pagination.has_prev else None
    }
    
    return jsonify({
        "services": services_list,
        "pagination": pagination_info
    })

@catalog_bp.route('/public/categories', methods=['GET'])
def get_public_categories():
    """Endpoint público para obtener todas las categorías"""
    categories = Category.query.all()
    
    categories_list = []
    for category in categories:
        categories_list.append({
            "id": category.id,
            "name": category.name,
            "parent_id": category.parent_id
        })
    
    return jsonify({"categories": categories_list})

@catalog_bp.route('/public/providers', methods=['GET'])
def get_public_providers():
    """Endpoint público para obtener todos los proveedores activos"""
    # Filtrar por usuarios activos que son proveedores
    providers = db.session.query(ProviderProfile).join(User).filter(
        User.role == 'proveedor',
        User.status == 'activo'
    ).all()
    return jsonify(providers=[{"id": p.id, "company_name": p.company_name} for p in providers])

@catalog_bp.route('/public/modalities', methods=['GET'])
def get_public_modalities():
    """Endpoint público para obtener todas las modalidades de servicios"""
    modalities = db.session.query(Service.modality).distinct().filter(
        Service.modality.isnot(None),
        Service.modality != ''
    ).all()
    return jsonify(modalities=[{"name": m[0]} for m in modalities])

@catalog_bp.route('/public/featured', methods=['GET'])
def get_featured_items():
    """Endpoint público para obtener productos y servicios destacados"""
    featured_products = Product.query.filter_by(status='activo', is_featured=True).all()
    featured_services = Service.query.filter_by(status='activo', is_featured=True).all()
    
    products_list = []
    for product in featured_products:
        provider = ProviderProfile.query.get(product.provider_id)
        category = Category.query.get(product.category_id)
        
        products_list.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "technical_details": product.technical_details,
            "sku": product.sku,
            "status": product.status,
            "is_featured": product.is_featured,
            "provider": {
                "id": provider.id,
                "company_name": provider.company_name,
                "about_us": provider.about_us,
                "logo_url": provider.logo_url,
                "website_url": provider.website_url
            } if provider else None,
            "category": {
                "id": category.id,
                "name": category.name
            } if category else None
        })
    
    services_list = []
    for service in featured_services:
        provider = ProviderProfile.query.get(service.provider_id)
        category = Category.query.get(service.category_id)
        
        services_list.append({
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "modality": service.modality,
            "status": service.status,
            "is_featured": service.is_featured,
            "provider": {
                "id": provider.id,
                "company_name": provider.company_name,
                "about_us": provider.about_us,
                "logo_url": provider.logo_url,
                "website_url": provider.website_url
            } if provider else None,
            "category": {
                "id": category.id,
                "name": category.name
            } if category else None
        })
    
    return jsonify({
        "featured_products": products_list,
        "featured_services": services_list
    })

@catalog_bp.route('/public/products/<int:product_id>', methods=['GET'])
def get_public_product_detail(product_id):
    """Endpoint público para obtener detalles completos de un producto específico"""
    product = Product.query.filter_by(id=product_id, status='activo').first()
    if not product:
        return jsonify({"message": "Producto no encontrado"}), 404
    
    provider = ProviderProfile.query.get(product.provider_id)
    category = Category.query.get(product.category_id)
    
    # Obtener contactos del proveedor
    provider_contacts = []
    if provider:
        contacts = ProviderContact.query.filter_by(provider_id=provider.id).all()
        provider_contacts = [{
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "position": contact.position,
            "is_primary": contact.is_primary
        } for contact in contacts]
    
    # Obtener certificaciones del proveedor
    provider_certifications = []
    if provider:
        certifications = ProviderCertification.query.filter_by(provider_id=provider.id).all()
        provider_certifications = [{
            "name": cert.name,
            "file_url": cert.file_url,
            "expiry_date": cert.expiry_date.isoformat() if cert.expiry_date else None,
            "uploaded_at": cert.uploaded_at.isoformat()
        } for cert in certifications]
    
    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "technical_details": product.technical_details,
        "sku": product.sku,
        "status": product.status,
        "is_featured": product.is_featured,
        "provider": {
            "id": provider.id,
            "company_name": provider.company_name,
            "about_us": provider.about_us,
            "logo_url": provider.logo_url,
            "brochure_pdf_url": provider.brochure_pdf_url,
            "website_url": provider.website_url,
            "contacts": provider_contacts,
            "certifications": provider_certifications
        } if provider else None,
        "category": {
            "id": category.id,
            "name": category.name
        } if category else None
    })

@catalog_bp.route('/public/services/<int:service_id>', methods=['GET'])
def get_public_service_detail(service_id):
    """Endpoint público para obtener detalles completos de un servicio específico"""
    service = Service.query.filter_by(id=service_id, status='activo').first()
    if not service:
        return jsonify({"message": "Servicio no encontrado"}), 404
    
    provider = ProviderProfile.query.get(service.provider_id)
    category = Category.query.get(service.category_id)
    
    # Obtener contactos del proveedor
    provider_contacts = []
    if provider:
        contacts = ProviderContact.query.filter_by(provider_id=provider.id).all()
        provider_contacts = [{
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "position": contact.position,
            "is_primary": contact.is_primary
        } for contact in contacts]
    
    # Obtener certificaciones del proveedor
    provider_certifications = []
    if provider:
        certifications = ProviderCertification.query.filter_by(provider_id=provider.id).all()
        provider_certifications = [{
            "name": cert.name,
            "file_url": cert.file_url,
            "expiry_date": cert.expiry_date.isoformat() if cert.expiry_date else None,
            "uploaded_at": cert.uploaded_at.isoformat()
        } for cert in certifications]
    
    return jsonify({
        "id": service.id,
        "name": service.name,
        "description": service.description,
        "modality": service.modality,
        "status": service.status,
        "is_featured": service.is_featured,
        "provider": {
            "id": provider.id,
            "company_name": provider.company_name,
            "about_us": provider.about_us,
            "logo_url": provider.logo_url,
            "brochure_pdf_url": provider.brochure_pdf_url,
            "website_url": provider.website_url,
            "contacts": provider_contacts,
            "certifications": provider_certifications
        } if provider else None,
        "category": {
            "id": category.id,
            "name": category.name
        } if category else None
    })

# --- Admin Endpoints for Featured Management ---

@catalog_bp.route('/admin/products/<int:product_id>/feature', methods=['PUT'])
@jwt_required()
def toggle_product_featured(product_id):
    """Endpoint para administradores: marcar/desmarcar producto como destacado"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'administrador':
        return jsonify({"message": "Acceso no autorizado"}), 403
    
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    product.is_featured = data.get('is_featured', False)
    db.session.commit()
    
    return jsonify({
        "message": "Estado de destacado actualizado",
        "product_id": product.id,
        "is_featured": product.is_featured
    })

@catalog_bp.route('/admin/services/<int:service_id>/feature', methods=['PUT'])
@jwt_required()
def toggle_service_featured(service_id):
    """Endpoint para administradores: marcar/desmarcar servicio como destacado"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != 'administrador':
        return jsonify({"message": "Acceso no autorizado"}), 403
    
    service = Service.query.get_or_404(service_id)
    data = request.get_json()
    
    service.is_featured = data.get('is_featured', False)
    db.session.commit()
    
    return jsonify({
        "message": "Estado de destacado actualizado",
        "service_id": service.id,
        "is_featured": service.is_featured
    }) 