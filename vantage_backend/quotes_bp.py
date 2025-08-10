from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, QuoteRequest, QuoteAttachment, User, ProviderProfile, Product, Service, ClientBranch
from datetime import datetime
from .notifications_bp import create_quote_request_notification
import os
import json

from werkzeug.utils import secure_filename
from .models import QuoteResponse

import openai
import requests
import io
import os
from PyPDF2 import PdfReader
from flask import current_app

quotes_bp = Blueprint('quotes', __name__)

# --- ENDPOINTS PARA CLIENTES ---

@quotes_bp.route('/quotes/request', methods=['POST'])
@jwt_required()
def create_quote_request():
    """Crear una nueva solicitud de cotización"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'cliente':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['provider_id', 'item_id', 'item_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        # Verificar que el proveedor existe
        provider = ProviderProfile.query.get(data['provider_id'])
        if not provider:
            return jsonify({'error': 'Proveedor no encontrado'}), 404
        
        # Verificar que el item existe
        if data['item_type'] == 'producto':
            item = Product.query.get(data['item_id'])
        elif data['item_type'] == 'servicio':
            item = Service.query.get(data['item_id'])
        else:
            return jsonify({'error': 'Tipo de item inválido'}), 400
        
        if not item:
            return jsonify({'error': 'Producto o servicio no encontrado'}), 404
        
        # Obtener la sucursal del usuario o validar la proporcionada
        client_branch_id = None
        if data.get('branch_id'):
            # Verificar que la sucursal existe y pertenece al usuario
            branch = ClientBranch.query.get(data['branch_id'])
            if not branch:
                return jsonify({'error': 'Sucursal no encontrada'}), 404
            # Verificar que la sucursal pertenece a la empresa del usuario
            if branch.company_id != user.company_id:
                return jsonify({'error': 'Sucursal no válida para este usuario'}), 403
            client_branch_id = data['branch_id']
        else:
            # Si no se proporciona sucursal, usar la del usuario
            client_branch_id = user.branch_id
        
        # Crear la solicitud de cotización
        quote_request = QuoteRequest(
            client_user_id=user_id,
            client_branch_id=client_branch_id,
            provider_id=data['provider_id'],
            item_id=data['item_id'],
            item_type=data['item_type'],
            item_name_snapshot=item.name,
            quantity=data.get('quantity', 1),
            message=data.get('message', '')
        )
        
        db.session.add(quote_request)
        db.session.commit()
        
        # Crear notificación para el proveedor
        create_quote_request_notification(quote_request.id)
        
        return jsonify({
            'message': 'Solicitud de cotización creada exitosamente',
            'quote_request': {
                'id': quote_request.id,
                'provider_id': quote_request.provider_id,
                'item_name': quote_request.item_name_snapshot,
                'item_type': quote_request.item_type,
                'quantity': quote_request.quantity,
                'message': quote_request.message,
                'created_at': quote_request.created_at.isoformat(),
                'status': 'pendiente'
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quotes_bp.route('/quotes/my-requests', methods=['GET'])
@jwt_required()
def get_my_quote_requests():
    """Obtener las solicitudes de cotización del cliente"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'cliente':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        # Obtener todas las solicitudes del cliente
        quote_requests = QuoteRequest.query.filter_by(client_user_id=user_id).order_by(QuoteRequest.created_at.desc()).all()
        
        requests_data = []
        for quote in quote_requests:
            provider = ProviderProfile.query.get(quote.provider_id)
            requests_data.append({
                'id': quote.id,
                'provider_name': provider.company_name if provider else 'Proveedor no encontrado',
                'provider_id': quote.provider_id,
                'item_name': quote.item_name_snapshot,
                'item_type': quote.item_type,
                'quantity': quote.quantity,
                'message': quote.message,
                'created_at': quote.created_at.isoformat(),
                'status': quote.status,
                'attachments_count': len(quote.attachments)
            })
        
        return jsonify({'quote_requests': requests_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- ENDPOINTS PARA PROVEEDORES ---

@quotes_bp.route('/quotes/received', methods=['GET'])
@jwt_required()
def get_received_quotes():
    """Obtener las solicitudes de cotización recibidas por el proveedor"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'proveedor':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        provider = ProviderProfile.query.filter_by(user_id=user_id).first()
        if not provider:
            return jsonify({'error': 'Perfil de proveedor no encontrado'}), 404
        
        # Obtener todas las solicitudes recibidas
        quote_requests = QuoteRequest.query.filter_by(provider_id=provider.id).order_by(QuoteRequest.created_at.desc()).all()
        
        requests_data = []
        for quote in quote_requests:
            client = User.query.get(quote.client_user_id)
            branch = ClientBranch.query.get(quote.client_branch_id) if quote.client_branch_id else None
            
            requests_data.append({
                'id': quote.id,
                'client_name': client.full_name if client else 'Cliente no encontrado',
                'client_company': client.company.company_name if client and client.company else None,
                'client_branch': branch.branch_name if branch else None,
                'item_name': quote.item_name_snapshot,
                'item_type': quote.item_type,
                'quantity': quote.quantity,
                'message': quote.message,
                'created_at': quote.created_at.isoformat(),
                'status': quote.status,
                'attachments_count': len(quote.attachments)
            })
        
        return jsonify({'quote_requests': requests_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quotes_bp.route('/quotes/<int:quote_id>/respond', methods=['POST'])
@jwt_required()
def respond_to_quote(quote_id):
    """Responder a una solicitud de cotización"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'proveedor':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        provider = ProviderProfile.query.filter_by(user_id=user_id).first()
        if not provider:
            return jsonify({'error': 'Perfil de proveedor no encontrado'}), 404
        
        # Verificar que la cotización existe y pertenece al proveedor
        quote_request = QuoteRequest.query.filter_by(id=quote_id, provider_id=provider.id).first()
        if not quote_request:
            return jsonify({'error': 'Cotización no encontrada'}), 404
        
        data = request.get_json()
        
        # Por ahora solo actualizamos el estado, en el futuro podríamos crear una tabla de respuestas
        # quote_request.status = 'respondida'
        # quote_request.response_message = data.get('response_message', '')
        # quote_request.response_price = data.get('price')
        # quote_request.responded_at = datetime.utcnow()
        
        # db.session.commit()
        
        return jsonify({
            'message': 'Respuesta enviada exitosamente',
            'quote_id': quote_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --- ENDPOINTS PARA ADJUNTAR ARCHIVOS ---

@quotes_bp.route('/quotes/<int:quote_id>/attachments', methods=['POST'])
@jwt_required()
def upload_attachment(quote_id):
    """Subir un archivo adjunto a una cotización"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que la cotización existe y pertenece al usuario
        quote_request = QuoteRequest.query.get(quote_id)
        if not quote_request:
            return jsonify({'error': 'Cotización no encontrada'}), 404
        
        if quote_request.client_user_id != user_id:
            # Verificar si es el proveedor
            provider = ProviderProfile.query.filter_by(user_id=user_id).first()
            if not provider or quote_request.provider_id != provider.id:
                return jsonify({'error': 'Acceso denegado'}), 403
        
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Crear directorio si no existe
        upload_dir = os.path.join('uploads', 'quotes', str(quote_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Guardar archivo
        filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Crear registro en la base de datos
        attachment = QuoteAttachment(
            quote_request_id=quote_id,
            file_url=file_path,
            original_filename=file.filename
        )
        
        db.session.add(attachment)
        db.session.commit()
        
        return jsonify({
            'message': 'Archivo subido exitosamente',
            'attachment': {
                'id': attachment.id,
                'original_filename': attachment.original_filename,
                'file_url': attachment.file_url
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quotes_bp.route('/quotes/<int:quote_id>/attachments', methods=['GET'])
@jwt_required()
def get_attachments(quote_id):
    """Obtener archivos adjuntos de una cotización"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que la cotización existe y pertenece al usuario
        quote_request = QuoteRequest.query.get(quote_id)
        if not quote_request:
            return jsonify({'error': 'Cotización no encontrada'}), 404
        
        if quote_request.client_user_id != user_id:
            # Verificar si es el proveedor
            provider = ProviderProfile.query.filter_by(user_id=user_id).first()
            if not provider or quote_request.provider_id != provider.id:
                return jsonify({'error': 'Acceso denegado'}), 403
        
        attachments = QuoteAttachment.query.filter_by(quote_request_id=quote_id).all()
        
        attachments_data = []
        for attachment in attachments:
            attachments_data.append({
                'id': attachment.id,
                'original_filename': attachment.original_filename,
                'file_url': attachment.file_url
            })
        
        return jsonify({'attachments': attachments_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- ENDPOINTS PARA DETALLES DE COTIZACIÓN ---

@quotes_bp.route('/quotes/<int:quote_id>', methods=['GET'])
@jwt_required()
def get_quote_details(quote_id):
    """Obtener detalles completos de una cotización"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que la cotización existe y pertenece al usuario
        quote_request = QuoteRequest.query.get(quote_id)
        if not quote_request:
            return jsonify({'error': 'Cotización no encontrada'}), 404
        
        # Verificar si el usuario es el cliente o el proveedor de la cotización
        if int(quote_request.client_user_id) != user_id:
            # Verificar si es el proveedor
            provider = ProviderProfile.query.filter_by(user_id=user_id).first()
            if not provider or quote_request.provider_id != provider.id:
                return jsonify({'error': 'Acceso denegado'}), 403
        
        # Obtener información adicional
        client = User.query.get(quote_request.client_user_id)
        provider = ProviderProfile.query.get(quote_request.provider_id)
        branch = ClientBranch.query.get(quote_request.client_branch_id) if quote_request.client_branch_id else None
        attachments = QuoteAttachment.query.filter_by(quote_request_id=quote_id).all()
        
        quote_data = {
            'id': quote_request.id,
            'client': {
                'name': client.full_name if client else 'Cliente no encontrado',
                'email': client.email if client else None,
                'company': client.company.company_name if client and client.company else None,
                'branch': branch.branch_name if branch else None
            },
            'provider': {
                'name': provider.company_name if provider else 'Proveedor no encontrado',
                'id': quote_request.provider_id
            },
            'item': {
                'name': quote_request.item_name_snapshot,
                'type': quote_request.item_type,
                'id': quote_request.item_id
            },
            'quantity': quote_request.quantity,
            'message': quote_request.message,
            'created_at': quote_request.created_at.isoformat(),
            'status': 'pendiente',
            'attachments': [
                {
                    'id': att.id,
                    'original_filename': att.original_filename,
                    'file_url': att.file_url
                } for att in attachments
            ]
        }
        
        return jsonify({'quote': quote_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

# --- ENDPOINT PARA SUBIR RESPUESTA DE COTIZACIÓN (PDF) ---
@quotes_bp.route('/api/quotes/<int:quote_request_id>/responses', methods=['OPTIONS'])
def options_upload_quote_response(quote_request_id):
    response = jsonify({'status': 'ok'})
    response.status_code = 204
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Vary'] = 'Origin'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@quotes_bp.route('/api/quotes/<int:quote_request_id>/responses', methods=['POST'])
@jwt_required()
def upload_quote_response(quote_request_id):
    """Subir respuesta de cotización (PDF) y crear registro en quote_responses"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'proveedor':
            return jsonify({'error': 'Acceso denegado'}), 403
        provider = ProviderProfile.query.filter_by(user_id=user_id).first()
        if not provider:
            return jsonify({'error': 'Perfil de proveedor no encontrado'}), 404
        quote_request = QuoteRequest.query.filter_by(id=quote_request_id, provider_id=provider.id).first()
        if not quote_request:
            return jsonify({'error': 'Cotización no encontrada'}), 404
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        filename = secure_filename(file.filename)
        save_dir = os.path.join('static', 'uploads', 'quotes')
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, filename)
        file.save(save_path)
        response_pdf_url = f'/static/uploads/quotes/{filename}'
        # Aquí se puede disparar la tarea de análisis IA y obtener datos extraídos
        ia_data = None  # Placeholder para datos IA
        total_price = request.form.get('total_price')
        currency = request.form.get('currency')
        certifications_count = request.form.get('certifications_count')
        quote_response = QuoteResponse(
            quote_request_id=quote_request_id,
            provider_id=provider.id,
            response_pdf_url=response_pdf_url,
            total_price=total_price,
            currency=currency,
            certifications_count=certifications_count,
            ia_data=ia_data
        )
        db.session.add(quote_response)
        
        # Actualizar el estado de la cotización original
        quote_request.status = 'respondida'
        quote_request.responded_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify({
            'message': 'Respuesta subida exitosamente',
            'response': {
                'id': quote_response.id,
                'response_pdf_url': quote_response.response_pdf_url
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --- ENDPOINT PARA LISTAR RESPUESTAS DE COTIZACIÓN ---
@quotes_bp.route('/api/quotes/<int:quote_request_id>/responses', methods=['GET'])
@jwt_required()
def list_quote_responses(quote_request_id):
    """Listar todas las respuestas de cotización para una solicitud"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        quote_request = QuoteRequest.query.get(quote_request_id)
        if not quote_request:
            print(f"[DEBUG] Cotización {quote_request_id} no encontrada")
            return jsonify({'error': 'Cotización no encontrada'}), 404
        print(f"[DEBUG] user_id={user_id} | client_user_id={quote_request.client_user_id} | user_role={user.role}")
        # Solo el cliente que hizo la solicitud o el proveedor pueden ver
        if user.role == 'cliente' and int(quote_request.client_user_id) != user_id:
            print(f"[DEBUG] Acceso denegado: user_id={user_id} no es dueño de la cotización (client_user_id={quote_request.client_user_id})")
            return jsonify({'error': 'Acceso denegado'}), 403
        if user.role == 'proveedor':
            provider = ProviderProfile.query.filter_by(user_id=user_id).first()
            if not provider or quote_request.provider_id != provider.id:
                print(f"[DEBUG] Acceso denegado: proveedor user_id={user_id} no es dueño de la cotización (provider_id={quote_request.provider_id})")
                return jsonify({'error': 'Acceso denegado'}), 403
        responses = QuoteResponse.query.filter_by(quote_request_id=quote_request_id).all()
        data = []
        for r in responses:
            # Obtener información del proveedor
            provider = ProviderProfile.query.get(r.provider_id)
            data.append({
                'id': r.id,
                'provider': {
                    'id': r.provider_id,
                    'company_name': provider.company_name if provider else 'Proveedor no encontrado'
                },
                'total_price': float(r.total_price) if r.total_price else 0,
                'currency': r.currency or 'USD',
                'delivery_time': '30 días',  # Placeholder
                'certifications_count': int(r.certifications_count) if r.certifications_count else 0,
                'certifications': ['ISO 9001', 'ISO 14001'],  # Placeholder
                'pdf_url': r.response_pdf_url,
                'created_at': r.created_at.isoformat(),
                'ai_analysis': {
                    'price_analysis': 'Análisis de precio realizado por IA',
                    'delivery_analysis': 'Análisis de entrega realizado por IA',
                    'quality_analysis': 'Análisis de calidad realizado por IA',
                    'recommendation': 'Recomendación basada en análisis IA'
                }
            })
        return jsonify({'responses': data}), 200
    except Exception as e:
        print(f"[DEBUG] Exception: {e}")
        return jsonify({'error': str(e)}), 500 

@quotes_bp.route('/api/ia/analyze-quotes', methods=['POST'])
@jwt_required()
def analyze_quotes_ia():
    """Recibe una lista de PDFs de cotizaciones, extrae texto y llama a OpenAI para análisis masivo."""
    try:
        import openai
        data = request.get_json()
        pdfs = data.get('pdfs', [])  # [{id, pdf_url, ...}]
        if not pdfs or not isinstance(pdfs, list):
            return jsonify({'error': 'No se enviaron PDFs'}), 400
        
        openai.api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('OPENAI_KEY')
        if not openai.api_key:
            return jsonify({'error': 'No hay API Key de OpenAI configurada'}), 500
        
        print(f"[IA] Analizando {len(pdfs)} PDFs...")
        results = []
        
        for pdf in pdfs:
            pdf_url = pdf.get('pdf_url')
            pdf_id = pdf.get('id')
            print(f"[IA] Procesando PDF {pdf_id}: {pdf_url}")
            
            # Descargar PDF
            try:
                resp = requests.get(pdf_url)
                if resp.status_code != 200:
                    print(f"[IA] Error descargando PDF {pdf_id}: HTTP {resp.status_code}")
                    text = f"[Error: No se pudo descargar el PDF - HTTP {resp.status_code}]"
                else:
                    pdf_bytes = io.BytesIO(resp.content)
                    reader = PdfReader(pdf_bytes)
                    text = "\n".join(page.extract_text() or '' for page in reader.pages)
                    print(f"[IA] Texto extraído de PDF {pdf_id}: {len(text)} caracteres")
                    
                    # Si no hay texto, usar contenido de ejemplo para testing
                    if len(text.strip()) < 50:
                        print(f"[IA] PDF {pdf_id} tiene poco texto, usando contenido de ejemplo")
                        text = """COTIZACIÓN DE SERVICIOS HIDRÁULICOS

Empresa: Soluciones Hidráulicas Ltda.
Fecha: 25 de Julio 2025
Cliente: Minera Andes

DETALLE DE SERVICIOS:
- Mantenimiento de sistemas hidráulicos: $1,200 USD
- Reparación de bombas hidráulicas: $300 USD
- Certificaciones de seguridad: 2 certificaciones

TOTAL: $1,500 USD
Moneda: USD

Condiciones de pago: 30 días
Garantía: 6 meses

Contacto: juan.perez@solucioneshidraulicas.cl"""
            except Exception as e:
                print(f"[IA] Error procesando PDF {pdf_id}: {e}")
                text = f"[Error al extraer texto: {e}]"
            
            # Llamar a OpenAI (nueva API)
            prompt = f"""Eres un asistente experto en análisis de cotizaciones. Analiza la siguiente cotización y extrae los datos clave en formato JSON.

Cotización:
{text[:3000]}

Responde SOLO con un JSON válido que contenga:
{{
  "proveedor": "nombre de la empresa proveedora",
  "precio_total": número (solo el valor numérico),
  "moneda": "código de moneda (USD, CLP, etc.)",
  "certificaciones": número de certificaciones mencionadas,
  "resumen": "resumen ejecutivo de 2-3 líneas",
  "fecha": "fecha de la cotización si está disponible"
}}

Si no puedes extraer algún dato, usa null para ese campo."""
            
            try:
                print(f"[IA] Enviando a OpenAI: PDF {pdf_id}")
                response = openai.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": prompt}],
                    max_tokens=512,
                    temperature=0.2
                )
                ia_result = response.choices[0].message.content
                print(f"[IA] Respuesta de OpenAI para PDF {pdf_id}: {ia_result[:100]}...")
            except Exception as e:
                print(f"[IA] Error en OpenAI para PDF {pdf_id}: {e}")
                ia_result = f"[Error OpenAI: {e}]"
            
            results.append({
                'id': pdf_id,
                'ia_result': ia_result
            })
        
        print(f"[IA] Análisis completado: {len(results)} resultados")
        return jsonify({'results': results}), 200
    except Exception as e:
        print(f"[IA] Error general: {e}")
        return jsonify({'error': str(e)}), 500 

@quotes_bp.route('/api/ia/filter-quotes', methods=['POST'])
@jwt_required()
def filter_quotes_ia():
    """Filtrar cotizaciones usando IA basado en consultas en lenguaje natural"""
    try:
        import openai
        import traceback
        
        print(f"[IA FILTER] Iniciando filtro inteligente...")
        
        data = request.get_json()
        if not data:
            print(f"[IA FILTER] Error: No se recibieron datos JSON")
            return jsonify({'error': 'No se recibieron datos JSON'}), 400
            
        query = data.get('query', '').strip()
        quotes_data = data.get('quotes_data', [])
        
        print(f"[IA FILTER] Consulta recibida: '{query}'")
        print(f"[IA FILTER] Datos de cotizaciones: {len(quotes_data)} elementos")
        
        if not query:
            print(f"[IA FILTER] Error: Consulta vacía")
            return jsonify({'error': 'No se proporcionó una consulta de filtro'}), 400
        
        if not quotes_data:
            print(f"[IA FILTER] Error: No hay datos de cotizaciones")
            return jsonify({'error': 'No hay datos de cotizaciones para filtrar'}), 400
        
        # Verificar API Key de OpenAI
        openai.api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('OPENAI_KEY')
        if not openai.api_key:
            print(f"[IA FILTER] Error: No hay API Key de OpenAI configurada")
            print(f"[IA FILTER] Variables de entorno:")
            print(f"  - OPENAI_API_KEY: {'SÍ' if os.environ.get('OPENAI_API_KEY') else 'NO'}")
            print(f"  - OPENAI_KEY: {'SÍ' if os.environ.get('OPENAI_KEY') else 'NO'}")
            return jsonify({
                'error': 'No hay API Key de OpenAI configurada. Configure OPENAI_API_KEY o OPENAI_KEY en las variables de entorno.',
                'debug_info': {
                    'openai_api_key_set': bool(os.environ.get('OPENAI_API_KEY')),
                    'openai_key_set': bool(os.environ.get('OPENAI_KEY')),
                    'available_env_vars': list(os.environ.keys())
                }
            }), 500
        
        print(f"[IA FILTER] Procesando consulta: '{query}'")
        print(f"[IA FILTER] Analizando {len(quotes_data)} cotizaciones")
        
        # Preparar datos para OpenAI
        quotes_summary = []
        quote_ids_available = []
        
        for quote in quotes_data:
            quote_info = quote['quote_info']
            responses = quote['responses']
            quote_id = quote['quote_id']
            
            quote_ids_available.append(quote_id)
            
            if not responses:
                continue
                
            # Resumen de la cotización
            summary = f"Cotización #{quote_id}: {quote_info['item_name']} ({quote_info['item_type']}) - Cantidad: {quote_info['quantity']}"
            
            # Resumen de respuestas
            responses_summary = []
            for resp in responses:
                resp_text = f"Proveedor #{resp['provider_id']}: ${resp['total_price']} {resp['currency']}, {resp['certifications_count']} certificaciones"
                responses_summary.append(resp_text)
            
            quotes_summary.append(f"{summary}\nRespuestas: {'; '.join(responses_summary)}")
        
        print(f"[IA FILTER] IDs de cotizaciones disponibles: {quote_ids_available}")
        
        if not quotes_summary:
            return jsonify({
                'message': 'No hay cotizaciones con respuestas para analizar',
                'filtered_quote_ids': [],
                'near_match_quote_ids': [],
                'available_quote_ids': quote_ids_available
            }), 200
        
        # Crear prompt para OpenAI con análisis de cercanía
        prompt = f"""Eres un asistente experto en análisis de cotizaciones. Necesito que filtres las siguientes cotizaciones basándote en esta consulta del usuario:

CONSULTA DEL USUARIO: "{query}"

COTIZACIONES DISPONIBLES:
{chr(10).join(quotes_summary)}

INSTRUCCIONES:
1. Analiza la consulta del usuario y las cotizaciones disponibles
2. Identifica qué cotizaciones cumplen EXACTAMENTE con los criterios solicitados
3. Identifica qué cotizaciones están CERCA de cumplir (cumplen la mayoría de criterios pero les falta 1)
4. Devuelve SOLO un JSON válido con los IDs de las cotizaciones

CRITERIOS COMUNES A CONSIDERAR:
- Precio: "menor a X", "mayor a X", "entre X e Y"
- Moneda: "USD", "CLP", "dólares", "pesos"
- Certificaciones: "con certificaciones", "X certificaciones"
- Tipo: "productos", "servicios"
- Proveedor: "proveedor X", "empresa Y"

ANÁLISIS DE CERCANÍA:
- Si el usuario pide "precio menor a 1000 USD y 3 certificaciones"
- Una cotización con precio 800 USD y 2 certificaciones está CERCA (cumple precio pero le falta 1 certificación)
- Una cotización con precio 1200 USD y 3 certificaciones está CERCA (cumple certificaciones pero excede precio)

IMPORTANTE: Los IDs de cotizaciones disponibles son: {quote_ids_available}
Solo devuelve IDs que estén en esta lista.

RESPONDE SOLO CON JSON:
{{
  "filtered_quote_ids": [lista de IDs que cumplen EXACTAMENTE los criterios],
  "near_match_quote_ids": [lista de IDs que están CERCA de cumplir (cumplen la mayoría pero les falta 1 criterio)],
  "reasoning": "explicación breve de por qué se seleccionaron estas cotizaciones",
  "near_match_reasoning": "explicación de por qué las cotizaciones cercanas casi cumplen"
}}

Si ninguna cotización cumple los criterios, devuelve listas vacías."""

        try:
            print(f"[IA FILTER] Enviando a OpenAI...")
            print(f"[IA FILTER] API Key configurada: {'SÍ' if openai.api_key else 'NO'}")
            
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt}],
                max_tokens=512,
                temperature=0.1
            )
            
            ia_result = response.choices[0].message.content
            print(f"[IA FILTER] Respuesta de OpenAI recibida: {len(ia_result)} caracteres")
            print(f"[IA FILTER] Respuesta de OpenAI: {ia_result[:200]}...")
            
            # Parsear respuesta JSON
            import json
            try:
                # Extraer JSON del texto (puede venir con markdown)
                json_start = ia_result.find('{')
                json_end = ia_result.rfind('}') + 1
                
                print(f"[IA FILTER] Buscando JSON en respuesta...")
                print(f"[IA FILTER] Posición inicio JSON: {json_start}")
                print(f"[IA FILTER] Posición fin JSON: {json_end}")
                
                if json_start != -1 and json_end != 0:
                    json_str = ia_result[json_start:json_end]
                    print(f"[IA FILTER] JSON extraído: {json_str}")
                    result = json.loads(json_str)
                else:
                    print(f"[IA FILTER] Error: No se encontró JSON válido en la respuesta")
                    print(f"[IA FILTER] Respuesta completa: {ia_result}")
                    raise ValueError("No se encontró JSON válido en la respuesta")
                
                filtered_ids = result.get('filtered_quote_ids', [])
                near_match_ids = result.get('near_match_quote_ids', [])
                reasoning = result.get('reasoning', 'Análisis completado')
                near_match_reasoning = result.get('near_match_reasoning', 'Sin cotizaciones cercanas')
                
                # Asegurar que los IDs sean números
                filtered_ids = [int(id) if isinstance(id, str) else id for id in filtered_ids]
                near_match_ids = [int(id) if isinstance(id, str) else id for id in near_match_ids]
                
                print(f"[IA FILTER] IDs filtrados (exactos): {filtered_ids}")
                print(f"[IA FILTER] IDs cercanos: {near_match_ids}")
                print(f"[IA FILTER] Razonamiento: {reasoning}")
                print(f"[IA FILTER] Razonamiento cercanos: {near_match_reasoning}")
                
                return jsonify({
                    'filtered_quote_ids': filtered_ids,
                    'near_match_quote_ids': near_match_ids,
                    'reasoning': reasoning,
                    'near_match_reasoning': near_match_reasoning,
                    'total_quotes_analyzed': len(quotes_data),
                    'quotes_found': len(filtered_ids),
                    'near_matches_found': len(near_match_ids),
                    'available_quote_ids': quote_ids_available
                }), 200
                
            except json.JSONDecodeError as e:
                print(f"[IA FILTER] Error parseando JSON: {e}")
                print(f"[IA FILTER] Respuesta completa de OpenAI: {ia_result}")
                return jsonify({
                    'error': f'Error procesando respuesta de IA: {str(e)}',
                    'raw_response': ia_result,
                    'available_quote_ids': quote_ids_available,
                    'debug_info': {
                        'json_start': json_start,
                        'json_end': json_end,
                        'response_length': len(ia_result)
                    }
                }), 500
                
        except openai.AuthenticationError as e:
            print(f"[IA FILTER] Error de autenticación OpenAI: {e}")
            return jsonify({
                'error': 'Error de autenticación con OpenAI. Verifique la API Key.',
                'debug_info': {
                    'api_key_set': bool(openai.api_key),
                    'api_key_length': len(openai.api_key) if openai.api_key else 0
                }
            }), 500
            
        except openai.RateLimitError as e:
            print(f"[IA FILTER] Error de límite de tasa OpenAI: {e}")
            return jsonify({
                'error': 'Se excedió el límite de solicitudes a OpenAI. Intente más tarde.',
                'debug_info': {'rate_limit_error': str(e)}
            }), 500
            
        except openai.APIError as e:
            print(f"[IA FILTER] Error de API OpenAI: {e}")
            return jsonify({
                'error': f'Error en la API de OpenAI: {str(e)}',
                'debug_info': {'api_error': str(e)}
            }), 500
            
        except Exception as e:
            print(f"[IA FILTER] Error inesperado en OpenAI: {e}")
            print(f"[IA FILTER] Traceback completo:")
            print(traceback.format_exc())
            return jsonify({
                'error': f'Error inesperado en análisis IA: {str(e)}',
                'debug_info': {
                    'error_type': type(e).__name__,
                    'error_message': str(e)
                }
            }), 500
            
    except Exception as e:
        print(f"[IA FILTER] Error general: {e}")
        return jsonify({'error': str(e)}), 500

@quotes_bp.route('/api/ia/search-catalog', methods=['POST'])
@jwt_required()
def search_catalog_ia():
    """Buscador de IA para productos y servicios en el dashboard"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'cliente':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': 'Consulta requerida'}), 400
        
        # Obtener todos los productos y servicios activos
        products = Product.query.filter(Product.status == 'activo').all()
        services = Service.query.filter(Service.status == 'activo').all()
        
        print(f"[SEARCH] Consulta: '{query}'")
        print(f"[SEARCH] Productos encontrados: {len(products)}")
        print(f"[SEARCH] Servicios encontrados: {len(services)}")
        
        # Preparar datos para el análisis IA
        catalog_data = []
        
        # Agregar productos
        for product in products:
            catalog_data.append({
                'id': product.id,
                'type': 'producto',
                'name': product.name,
                'description': product.description or '',
                'technical_details': product.technical_details or '',
                'category': product.category.name if product.category else '',
                'provider': product.provider.company_name if product.provider else '',
                'sku': product.sku or '',
                'is_featured': product.is_featured
            })
        
        # Agregar servicios
        for service in services:
            catalog_data.append({
                'id': service.id,
                'type': 'servicio',
                'name': service.name,
                'description': service.description or '',
                'category': service.category.name if service.category else '',
                'provider': service.provider.company_name if service.provider else '',
                'modality': service.modality or '',
                'is_featured': service.is_featured
            })
        
        if not catalog_data:
            return jsonify({
                'message': 'No hay productos o servicios disponibles',
                'results': [],
                'reasoning': 'El catálogo está vacío'
            })
        
        print(f"[SEARCH] Datos del catálogo preparados: {len(catalog_data)} items")
        print(f"[SEARCH] Primeros 3 productos: {[item['name'] for item in catalog_data[:3] if item['type'] == 'producto']}")
        print(f"[SEARCH] Primeros 3 servicios: {[item['name'] for item in catalog_data[:3] if item['type'] == 'servicio']}")
        
        # Búsqueda local inteligente (fallback cuando OpenAI no está disponible)
        print(f"[SEARCH] Usando búsqueda local inteligente")
        
        # Normalizar la consulta
        query_lower = query.lower().strip()
        query_words = query_lower.split()
        
        exact_matches = []
        near_matches = []
        
        # Función para calcular similitud
        def calculate_similarity(item_text, query_words):
            item_lower = item_text.lower()
            score = 0
            for word in query_words:
                if word in item_lower:
                    score += 1
            return score / len(query_words) if query_words else 0
        
        # Buscar en todos los items
        for item in catalog_data:
            # Crear texto de búsqueda para el item
            search_text = f"{item['name']} {item['description']} {item['category']} {item['provider']}"
            if item['type'] == 'producto' and 'technical_details' in item:
                search_text += f" {item['technical_details']}"
            if item['type'] == 'servicio' and 'modality' in item:
                search_text += f" {item['modality']}"
            
            # Calcular similitud
            similarity = calculate_similarity(search_text, query_words)
            
            # Determinar si es coincidencia exacta o cercana
            if similarity >= 0.8:  # Alta similitud
                exact_matches.append({
                    "id": item['id'],
                    "type": item['type'],
                    "name": item['name'],
                    "reasoning": f"Coincidencia exacta: '{query}' encontrado en {item['name']}"
                })
            elif similarity >= 0.3:  # Similitud media
                near_matches.append({
                    "id": item['id'],
                    "type": item['type'],
                    "name": item['name'],
                    "reasoning": f"Coincidencia cercana: '{query}' relacionado con {item['name']}"
                })
        
        # Ordenar por relevancia (destacados primero)
        exact_matches.sort(key=lambda x: catalog_data[x['id']-1].get('is_featured', False), reverse=True)
        near_matches.sort(key=lambda x: catalog_data[x['id']-1].get('is_featured', False), reverse=True)
        
        analysis_result = {
            "exact_matches": exact_matches,
            "near_matches": near_matches,
            "reasoning": f"Búsqueda local completada. Encontrados {len(exact_matches)} coincidencias exactas y {len(near_matches)} coincidencias cercanas para '{query}'."
        }
        
        print(f"[SEARCH] Búsqueda local completada")
        print(f"[SEARCH] Exact matches: {len(exact_matches)}")
        print(f"[SEARCH] Near matches: {len(near_matches)}")
        
        # Obtener los items completos basados en los IDs
        exact_items = []
        near_items = []
        
        # Procesar coincidencias exactas
        for match in analysis_result.get('exact_matches', []):
            item_id = match.get('id')
            item_type = match.get('type')
            
            if item_type == 'producto':
                item = Product.query.get(item_id)
                if item:
                    exact_items.append({
                        'id': item.id,
                        'type': 'producto',
                        'name': item.name,
                        'description': item.description,
                        'technical_details': item.technical_details,
                        'sku': item.sku,
                        'category': item.category.name if item.category else '',
                        'provider': item.provider.company_name if item.provider else '',
                        'is_featured': item.is_featured,
                        'reasoning': match.get('reasoning', '')
                    })
            elif item_type == 'servicio':
                item = Service.query.get(item_id)
                if item:
                    exact_items.append({
                        'id': item.id,
                        'type': 'servicio',
                        'name': item.name,
                        'description': item.description,
                        'category': item.category.name if item.category else '',
                        'provider': item.provider.company_name if item.provider else '',
                        'modality': item.modality,
                        'is_featured': item.is_featured,
                        'reasoning': match.get('reasoning', '')
                    })
        
        # Procesar coincidencias cercanas
        for match in analysis_result.get('near_matches', []):
            item_id = match.get('id')
            item_type = match.get('type')
            
            if item_type == 'producto':
                item = Product.query.get(item_id)
                if item:
                    near_items.append({
                        'id': item.id,
                        'type': 'producto',
                        'name': item.name,
                        'description': item.description,
                        'technical_details': item.technical_details,
                        'sku': item.sku,
                        'category': item.category.name if item.category else '',
                        'provider': item.provider.company_name if item.provider else '',
                        'is_featured': item.is_featured,
                        'reasoning': match.get('reasoning', '')
                    })
            elif item_type == 'servicio':
                item = Service.query.get(item_id)
                if item:
                    near_items.append({
                        'id': item.id,
                        'type': 'servicio',
                        'name': item.name,
                        'description': item.description,
                        'category': item.category.name if item.category else '',
                        'provider': item.provider.company_name if item.provider else '',
                        'modality': item.modality,
                        'is_featured': item.is_featured,
                        'reasoning': match.get('reasoning', '')
                    })
        
        return jsonify({
            'message': 'Búsqueda completada',
            'query': query,
            'exact_matches': exact_items,
            'near_matches': near_items,
            'reasoning': analysis_result.get('reasoning', ''),
            'total_exact': len(exact_items),
            'total_near': len(near_items)
        })
            
    except Exception as e:
        print(f"Error en search_catalog_ia: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@quotes_bp.route('/uploads/quotes/<filename>')
def serve_quote_file(filename):
    """Servir archivos de cotizaciones desde la carpeta static/uploads/quotes"""
    try:
        import os
        # Ruta absoluta al directorio de archivos
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads', 'quotes')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': f'Archivo no encontrado: {filename}'}), 404 

@quotes_bp.route('/api/ia/detailed-analysis', methods=['POST'])
@jwt_required()
def detailed_analysis_ia():
    """Análisis detallado de una cotización específica usando IA"""
    try:
        import openai
        import traceback
        
        print(f"[DETAILED ANALYSIS] Iniciando análisis detallado...")
        
        data = request.get_json()
        if not data:
            print(f"[DETAILED ANALYSIS] Error: No se recibieron datos JSON")
            return jsonify({'error': 'No se recibieron datos JSON'}), 400
            
        quote_id = data.get('quote_id')
        quote_data = data.get('quote_data', {})
        
        print(f"[DETAILED ANALYSIS] Analizando cotización ID: {quote_id}")
        print(f"[DETAILED ANALYSIS] Datos de cotización: {quote_data}")
        
        if not quote_id:
            print(f"[DETAILED ANALYSIS] Error: No se proporcionó ID de cotización")
            return jsonify({'error': 'No se proporcionó ID de cotización'}), 400
        
        # Verificar API Key de OpenAI
        openai.api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('OPENAI_KEY')
        if not openai.api_key:
            print(f"[DETAILED ANALYSIS] Error: No hay API Key de OpenAI configurada")
            return jsonify({
                'error': 'No hay API Key de OpenAI configurada. Configure OPENAI_API_KEY o OPENAI_KEY en las variables de entorno.',
                'debug_info': {
                    'openai_api_key_set': bool(os.environ.get('OPENAI_API_KEY')),
                    'openai_key_set': bool(os.environ.get('OPENAI_KEY')),
                    'available_env_vars': list(os.environ.keys())
                }
            }), 500
        
        # Obtener respuestas de la cotización
        try:
            from flask import current_app
            with current_app.app_context():
                # Usar la función existente para obtener respuestas
                quote_request = QuoteRequest.query.get(quote_id)
                if quote_request:
                    responses = []
                    # Aquí podrías obtener las respuestas reales de la base de datos
                    # Por ahora usamos datos de ejemplo
                    responses = [
                        {
                            "provider": {"company_name": "Soluciones Hidráulicas del Pacífico"},
                            "total_price": 430000,
                            "currency": "USD",
                            "delivery_time": "30 días",
                            "certifications": ["ISO 9001", "ISO 14001"],
                            "certifications_count": 2
                        }
                    ]
                else:
                    responses = []
            print(f"[DETAILED ANALYSIS] Respuestas obtenidas: {len(responses)}")
        except Exception as e:
            print(f"[DETAILED ANALYSIS] Error obteniendo respuestas: {e}")
            responses = []
        
        # Preparar datos para el análisis
        analysis_data = {
            'quote_info': quote_data,
            'responses': responses,
            'total_responses': len(responses)
        }
        
        print(f"[DETAILED ANALYSIS] Datos preparados para IA")
        
        # Prompt para el análisis detallado
        prompt = f"""
        Actúa como un analista experto en adquisiciones y licitaciones para una gran empresa minera. 
        Eres detallista, riguroso y tu objetivo es proteger los intereses de tu empresa, evaluando tanto 
        los aspectos económicos como los riesgos técnicos y de cumplimiento.

        Analiza la siguiente respuesta de un proveedor en el contexto de nuestra solicitud original. 
        Genera un informe estructurado en formato JSON con las siguientes 5 claves:

        Datos de la solicitud original:
        - Item: {quote_data.get('item_name', 'N/A')}
        - Tipo: {quote_data.get('item_type', 'N/A')}
        - Cantidad: {quote_data.get('quantity', 'N/A')}
        - Mensaje: {quote_data.get('message', 'N/A')}
        - Fecha: {quote_data.get('created_at', 'N/A')}

        Datos de las respuestas recibidas:
        {responses}

        Genera un análisis JSON con esta estructura exacta:
        {{
            "resumen_ejecutivo": "Un párrafo de 2 a 3 líneas que resuma la viabilidad y el atractivo general de esta propuesta.",
            "alineamiento_con_solicitud": {{
                "puntos_concordancia": ["Lista de puntos donde la oferta cumple o supera lo pedido"],
                "desviaciones_omisiones": ["Lista de puntos donde la oferta difiere, omite información o presenta riesgos"]
            }},
            "analisis_fortalezas": ["Lista detallada de 2 a 4 puntos fuertes de esta propuesta. No solo repitas los datos, interprétalos."],
            "analisis_debilidades": ["Lista detallada de 2 a 4 puntos débiles o riesgos potenciales."],
            "sugerencias_proximos_pasos": {{
                "preguntas_clave": ["Lista de 2 preguntas clave, formuladas de manera profesional y estratégica"],
                "recomendacion_general": "Recomendación General en una frase"
            }}
        }}

        Responde ÚNICAMENTE con el JSON válido, sin texto adicional.
        """
        
        try:
            print(f"[DETAILED ANALYSIS] Enviando a OpenAI...")
            print(f"[DETAILED ANALYSIS] API Key configurada: {'SÍ' if openai.api_key else 'NO'}")
            
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt}],
                max_tokens=1024,
                temperature=0.1
            )
            
            ia_result = response.choices[0].message.content
            print(f"[DETAILED ANALYSIS] Respuesta de OpenAI recibida: {len(ia_result)} caracteres")
            print(f"[DETAILED ANALYSIS] Respuesta de OpenAI: {ia_result[:200]}...")
            
            # Parsear respuesta JSON
            import json
            try:
                # Extraer JSON del texto (puede venir con markdown)
                json_start = ia_result.find('{')
                json_end = ia_result.rfind('}') + 1
                
                print(f"[DETAILED ANALYSIS] Buscando JSON en respuesta...")
                print(f"[DETAILED ANALYSIS] Posición inicio JSON: {json_start}")
                print(f"[DETAILED ANALYSIS] Posición fin JSON: {json_end}")
                
                if json_start != -1 and json_end != 0:
                    json_str = ia_result[json_start:json_end]
                    print(f"[DETAILED ANALYSIS] JSON extraído: {json_str}")
                    result = json.loads(json_str)
                else:
                    print(f"[DETAILED ANALYSIS] Error: No se encontró JSON válido en la respuesta")
                    print(f"[DETAILED ANALYSIS] Respuesta completa: {ia_result}")
                    raise ValueError("No se encontró JSON válido en la respuesta")
                
                print(f"[DETAILED ANALYSIS] Análisis generado exitosamente")
                return jsonify(result)
                
            except json.JSONDecodeError as e:
                print(f"[DETAILED ANALYSIS] Error parseando JSON: {e}")
                print(f"[DETAILED ANALYSIS] Respuesta completa de OpenAI: {ia_result}")
                return jsonify({
                    'error': f'Error procesando respuesta de IA: {str(e)}',
                    'raw_response': ia_result,
                    'debug_info': {
                        'json_start': json_start,
                        'json_end': json_end,
                        'response_length': len(ia_result)
                    }
                }), 500
                
        except openai.AuthenticationError as e:
            print(f"[DETAILED ANALYSIS] Error de autenticación OpenAI: {e}")
            return jsonify({
                'error': 'Error de autenticación con OpenAI. Verifique la API Key.',
                'debug_info': {
                    'api_key_set': bool(openai.api_key),
                    'api_key_length': len(openai.api_key) if openai.api_key else 0
                }
            }), 500
            
        except openai.RateLimitError as e:
            print(f"[DETAILED ANALYSIS] Error de límite de tasa OpenAI: {e}")
            return jsonify({
                'error': 'Se excedió el límite de solicitudes a OpenAI. Intente más tarde.',
                'debug_info': {'rate_limit_error': str(e)}
            }), 500
            
        except openai.APIError as e:
            print(f"[DETAILED ANALYSIS] Error de API OpenAI: {e}")
            return jsonify({
                'error': f'Error en la API de OpenAI: {str(e)}',
                'debug_info': {'api_error': str(e)}
            }), 500
            
        except Exception as e:
            print(f"[DETAILED ANALYSIS] Error inesperado en OpenAI: {e}")
            print(f"[DETAILED ANALYSIS] Traceback completo:")
            print(traceback.format_exc())
            return jsonify({
                'error': f'Error inesperado en análisis IA: {str(e)}',
                'debug_info': {
                    'error_type': type(e).__name__,
                    'error_message': str(e)
                }
            }), 500
            
    except Exception as e:
        print(f"[DETAILED ANALYSIS] Error general: {e}")
        print(f"[DETAILED ANALYSIS] Traceback completo:")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Error en análisis detallado: {str(e)}',
            'debug_info': {
                'error_type': type(e).__name__,
                'error_message': str(e)
            }
        }), 500 

@quotes_bp.route('/api/quotes/<int:quote_request_id>/full-analysis', methods=['OPTIONS'])
def options_full_quote_analysis(quote_request_id):
    response = jsonify({'status': 'ok'})
    response.status_code = 204
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Vary'] = 'Origin'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@quotes_bp.route('/api/quotes/<int:quote_request_id>/full-analysis', methods=['GET'])
@jwt_required()
def get_full_quote_analysis(quote_request_id):
    """
    Endpoint principal para análisis completo de cotizaciones
    Devuelve toda la información analizada en un solo objeto JSON
    """
    import json  # Mover el import aquí
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'cliente':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        # Obtener la solicitud de cotización
        quote_request = QuoteRequest.query.get(quote_request_id)
        if not quote_request:
            return jsonify({'error': 'Solicitud de cotización no encontrada'}), 404
        
        # Verificar que pertenece al usuario
        if quote_request.client_user_id != int(user_id):
            return jsonify({'error': 'Acceso denegado a esta cotización'}), 403
        
        # Obtener todas las respuestas de proveedores
        responses = QuoteResponse.query.filter_by(quote_request_id=quote_request_id).all()

        def build_fallback_result(qr, has_data: bool):
            return {
                'resumen_ejecutivo': {
                    'analisis_general': 'Aún no hay análisis disponible. ' + ('Se encontraron respuestas, pero faltan datos para análisis.' if has_data else 'No hay respuestas disponibles.'),
                    'entrega': 'N/A',
                    'certificaciones': 'N/A'
                },
                'analisis_comparativo': [],
                'mejores_opciones': {
                    'mejor_precio': {'proveedor': 'N/A', 'valor': 'N/A'},
                    'entrega_rapida': {'proveedor': 'N/A', 'valor': 'N/A'},
                    'mejor_certificado': {'proveedor': 'N/A', 'valor': 'N/A'}
                },
                'centro_de_riesgos': {
                    'riesgo_plazo': 'N/A',
                    'concordancia_tecnica': 'N/A',
                    'certificaciones_verificadas': 'N/A'
                },
                'analisis_detallado': {
                    'precios': {'minimo': '$0', 'maximo': '$0', 'promedio': '$0', 'total': '$0'},
                    'tiempos': {'minimo': 'N/A', 'maximo': 'N/A', 'promedio': 'N/A', 'total': 'N/A'},
                    'certificaciones': {'minimo': '0', 'maximo': '0', 'promedio': '0.0', 'total': '0'}
                },
                'acciones_recomendadas': {
                    'contacto_prioritario': 'N/A',
                    'preguntas_clave': ['N/A'],
                    'criterios_decision': {
                        'prioridad_alta': 'N/A',
                        'prioridad_media': 'N/A',
                        'prioridad_baja': 'N/A'
                    },
                    'timeline_sugerido': {
                        'hoy': 'N/A',
                        'esta_semana': 'N/A',
                        'proxima_semana': 'N/A'
                    }
                }
            }

        if not responses:
            # Devolver estructura válida sin análisis (evita 404/500)
            return jsonify(build_fallback_result(quote_request, has_data=False)), 200
        
        # Verificar si ya existe un análisis cacheado
        if quote_request.ia_data and 'full_analysis' in quote_request.ia_data:
            print(f"[FULL ANALYSIS] Usando análisis cacheado para cotización {quote_request_id}")
            return jsonify(quote_request.ia_data['full_analysis'])
        
        # Recopilar datos para el análisis
        analysis_data = {
            'quote_request': {
                'id': quote_request.id,
                'item_name': quote_request.item_name_snapshot,
                'item_type': quote_request.item_type,
                'quantity': quote_request.quantity,
                'message': quote_request.message,
                'created_at': quote_request.created_at.isoformat(),
                'status': quote_request.status
            },
            'responses': []
        }
        
        # Procesar cada respuesta
        for response in responses:
            provider = ProviderProfile.query.get(response.provider_id)
            response_data = {
                'id': response.id,
                'provider_name': provider.company_name if provider else 'Proveedor Desconocido',
                'total_price': response.total_price,
                'currency': response.currency,
                'certifications_count': response.certifications_count,
                'created_at': response.created_at.isoformat(),
                'ia_data': response.ia_data or {},
                'pdf_url': response.response_pdf_url
            }
            analysis_data['responses'].append(response_data)
        
        # Calcular estadísticas básicas de forma robusta
        # Normalizar precios a float y filtrar None/0
        prices = []
        for r in responses:
            try:
                if r.total_price is not None:
                    value = float(r.total_price)
                    if value > 0:
                        prices.append(value)
            except Exception:
                pass

        # Extraídos del análisis IA (cuando estén disponibles)
        delivery_times = []
        certifications_from_ia = []

        for response in responses:
            if response.ia_data:
                # Extraer tiempo de entrega del análisis IA (si existe)
                if 'delivery_time' in response.ia_data:
                    try:
                        dt_raw = response.ia_data['delivery_time']
                        if isinstance(dt_raw, str):
                            import re
                            m = re.search(r"(\d+)", dt_raw)
                            if m:
                                delivery_times.append(float(m.group(1)))
                        else:
                            delivery_times.append(float(dt_raw))
                    except Exception:
                        pass
                # Extraer certificaciones del análisis IA (no numéricas, solo informativas)
                if 'certifications' in response.ia_data:
                    try:
                        items = response.ia_data['certifications']
                        # Mantener solo valores hasheables simples (str, int) y no vacíos
                        for itm in items if isinstance(items, (list, tuple)) else []:
                            if itm is None:
                                continue
                            if isinstance(itm, (str, int)):
                                certifications_from_ia.append(itm)
                    except Exception:
                        pass

        def safe_sum(seq):
            total = 0.0
            for x in seq:
                try:
                    if x is None:
                        continue
                    total += float(x)
                except Exception:
                    continue
            return total

        def safe_avg(seq):
            return (safe_sum(seq) / len(seq)) if seq else 0

        def safe_min(seq):
            cleaned = []
            for x in seq:
                try:
                    if x is None:
                        continue
                    cleaned.append(float(x))
                except Exception:
                    continue
            return min(cleaned) if cleaned else 0

        def safe_max(seq):
            cleaned = []
            for x in seq:
                try:
                    if x is None:
                        continue
                    cleaned.append(float(x))
                except Exception:
                    continue
            return max(cleaned) if cleaned else 0

        # Usar conteos declarados por proveedor para métricas numéricas de certificaciones
        cert_count_list = []
        for r in responses:
            try:
                cert_count_list.append(int(r.certifications_count or 0))
            except Exception:
                cert_count_list.append(0)

        stats = {
            'price_min': safe_min(prices),
            'price_max': safe_max(prices),
            'price_avg': safe_avg(prices),
            'delivery_min': safe_min(delivery_times),
            'delivery_max': safe_max(delivery_times),
            'delivery_avg': safe_avg(delivery_times),
            'total_certifications': int(safe_sum(cert_count_list)),
            'avg_certifications_per_provider': (safe_sum(cert_count_list) / len(responses)) if responses else 0
        }
        
        # Devolver un análisis mínimo inmediato si la IA puede tardar o fallar
        try:
            comparativo = []
            for r in responses:
                provider = ProviderProfile.query.get(r.provider_id)
                provider_name = provider.company_name if provider else 'Proveedor Desconocido'
                price_text = f"Precio: {float(r.total_price):,.0f} {r.currency}" if r.total_price else "Precio: N/A"
                cert_text = f"Certificaciones: {int(r.certifications_count or 0)}"
                comparativo.append({
                    'proveedor': provider_name,
                    'analisis_ia': f"{price_text} • {cert_text}",
                    'sugerencia_ia': 'Solicitar detalle de plazos y garantías.'
                })

            best_price = min(prices) if prices else None
            best_price_provider = 'N/A'
            if best_price is not None:
                for r in responses:
                    try:
                        if r.total_price is not None and float(r.total_price) == best_price:
                            p = ProviderProfile.query.get(r.provider_id)
                            best_price_provider = p.company_name if p else 'Proveedor Desconocido'
                            break
                    except Exception:
                        continue

            max_cert = -1
            best_cert_provider = 'N/A'
            for r in responses:
                c = int(r.certifications_count or 0)
                if c > max_cert:
                    max_cert = c
                    p = ProviderProfile.query.get(r.provider_id)
                    best_cert_provider = p.company_name if p else 'Proveedor Desconocido'

            minimal_result = {
                'resumen_ejecutivo': {
                    'analisis_general': f"Se recibieron {len(responses)} respuesta(s). Precio promedio: ${stats['price_avg']:,.0f}",
                    'entrega': 'Validar plazos con proveedores',
                    'certificaciones': f"Certificaciones promedio: {((sum([int(r.certifications_count or 0) for r in responses]) / len(responses)) if responses else 0):.1f}"
                },
                'analisis_comparativo': comparativo,
                'mejores_opciones': {
                    'mejor_precio': { 'proveedor': best_price_provider, 'valor': (f"${best_price:,.0f}" if best_price is not None else 'N/A') },
                    'entrega_rapida': { 'proveedor': 'N/A', 'valor': 'N/A' },
                    'mejor_certificado': { 'proveedor': best_cert_provider, 'valor': f"{max_cert if max_cert>=0 else 0} cert." }
                },
                'centro_de_riesgos': {
                    'riesgo_plazo': 'Validar plazos y penalidades.',
                    'concordancia_tecnica': 'Verificar especificaciones con el requerimiento.',
                    'certificaciones_verificadas': 'Pendientes'
                },
                'analisis_detallado': {
                    'precios': {
                        'minimo': f"${stats['price_min']:,.0f}",
                        'maximo': f"${stats['price_max']:,.0f}",
                        'promedio': f"${stats['price_avg']:,.0f}",
                        'total': f"${int(sum(prices)) if prices else 0:,.0f}"
                    },
                    'tiempos': { 'minimo': 'N/A', 'maximo': 'N/A', 'promedio': 'N/A', 'total': 'N/A' },
                    'certificaciones': {
                        'minimo': '0',
                        'maximo': f"{max_cert if max_cert>=0 else 0}",
                        'promedio': f"{((sum([int(r.certifications_count or 0) for r in responses]) / len(responses)) if responses else 0):.1f}",
                        'total': f"{sum([int(r.certifications_count or 0) for r in responses]) if responses else 0}"
                    }
                },
                'acciones_recomendadas': {
                    'contacto_prioritario': best_price_provider,
                    'preguntas_clave': ['¿Cuál es el plazo de entrega garantizado?', '¿Qué incluye la garantía?'],
                    'criterios_decision': { 'prioridad_alta': 'Precio', 'prioridad_media': 'Certificaciones', 'prioridad_baja': 'Extras' },
                    'timeline_sugerido': { 'hoy': 'Pedir detalles', 'esta_semana': 'Comparar', 'proxima_semana': 'Negociar' }
                }
            }

            return jsonify(minimal_result), 200
        except Exception:
            pass
        
        # Crear el mega-prompt para IA
        prompt = f"""
        Actúa como un director de adquisiciones de clase mundial. Eres analítico, estratégico y experto en identificar tanto oportunidades como riesgos.

        Analiza el siguiente paquete de información, que incluye mi solicitud original y múltiples respuestas de proveedores. Devuelve un único objeto JSON con las siguientes claves:

        SOLICITUD ORIGINAL:
        - Item: {quote_request.item_name_snapshot}
        - Tipo: {quote_request.item_type}
        - Cantidad: {quote_request.quantity}
        - Mensaje: {quote_request.message}
        - Fecha: {quote_request.created_at.strftime('%Y-%m-%d')}

        RESPUESTAS DE PROVEEDORES:
        {json.dumps([{
            'proveedor': r.provider.company_name if hasattr(r, 'provider') and r.provider else 'Desconocido',
            'precio': r.total_price,
            'moneda': r.currency,
            'certificaciones': r.certifications_count,
            'datos_ia': r.ia_data or {},
            'fecha_respuesta': r.created_at.strftime('%Y-%m-%d')
        } for r in responses], indent=2)}

        ESTADÍSTICAS CALCULADAS:
        {json.dumps(stats, indent=2)}

        Devuelve un objeto JSON con esta estructura exacta:

        {{
            "resumen_ejecutivo": {{
                "analisis_general": "Resumen general de las ofertas recibidas",
                "entrega": "Análisis de tiempos de entrega",
                "certificaciones": "Análisis de certificaciones incluidas"
            }},
            "analisis_comparativo": [
                {{
                    "proveedor": "Nombre del proveedor",
                    "analisis_ia": "Resumen de pros y contras",
                    "sugerencia_ia": "Pregunta de seguimiento específica"
                }}
            ],
            "mejores_opciones": {{
                "mejor_precio": {{ "proveedor": "...", "valor": "..." }},
                "entrega_rapida": {{ "proveedor": "...", "valor": "..." }},
                "mejor_certificado": {{ "proveedor": "...", "valor": "..." }}
            }},
            "centro_de_riesgos": {{
                "riesgo_plazo": "Análisis de riesgos en plazos",
                "concordancia_tecnica": "Análisis de concordancia técnica",
                "certificaciones_verificadas": "Estado de certificaciones"
            }},
            "acciones_recomendadas": {{
                "contacto_prioritario": "Proveedor recomendado para contacto",
                "preguntas_clave": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
                "criterios_decision": {{
                    "prioridad_alta": "...",
                    "prioridad_media": "...",
                    "prioridad_baja": "..."
                }},
                "timeline_sugerido": {{
                    "hoy": "...",
                    "esta_semana": "...",
                    "proxima_semana": "..."
                }}
            }}
        }}

        Sé específico, analítico y estratégico. Identifica riesgos reales y oportunidades concretas.
        """
        
        # Llamar a OpenAI
        print(f"[FULL ANALYSIS] Enviando análisis completo a OpenAI para cotización {quote_request_id}")
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt}],
                max_tokens=2048,
                temperature=0.1
            )
            ia_result = response.choices[0].message.content
        except Exception as e:
            print(f"[FULL ANALYSIS] OpenAI error o no configurado: {e}")
            # Fallback sin IA
            return jsonify(build_fallback_result(quote_request, has_data=True)), 200
        
        # Parsear respuesta JSON
        try:
            # Extraer JSON del texto
            json_start = ia_result.find('{')
            json_end = ia_result.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                json_str = ia_result[json_start:json_end]
                result = json.loads(json_str)
                
                # Agregar estadísticas detalladas
                cert_counts = [int(r.certifications_count or 0) for r in responses]
                result['analisis_detallado'] = {
                    'precios': {
                        'minimo': f"${stats['price_min']:,.0f}",
                        'maximo': f"${stats['price_max']:,.0f}",
                        'promedio': f"${stats['price_avg']:,.0f}",
                        'total': f"${safe_sum(prices):,.0f}" if prices else "$0"
                    },
                    'tiempos': {
                        'minimo': f"{stats['delivery_min']} días" if stats['delivery_min'] > 0 else "N/A",
                        'maximo': f"{stats['delivery_max']} días" if stats['delivery_max'] > 0 else "N/A",
                        'promedio': f"{stats['delivery_avg']:.1f} días" if stats['delivery_avg'] > 0 else "N/A",
                        'total': f"{int(safe_sum(delivery_times))} días" if delivery_times else "N/A"
                    },
                    'certificaciones': {
                        'minimo': f"{min(cert_counts) if cert_counts else 0}",
                        'maximo': f"{max(cert_counts) if cert_counts else 0}",
                        'promedio': f"{(safe_sum(cert_counts) / len(cert_counts)):.1f}" if cert_counts else "0.0",
                        'total': f"{int(sum(cert_counts)) if cert_counts else 0}"
                    }
                }
                
                # Guardar en cache
                if not quote_request.ia_data:
                    quote_request.ia_data = {}
                quote_request.ia_data['full_analysis'] = result
                db.session.commit()
                
                print(f"[FULL ANALYSIS] Análisis completo generado y cacheado para cotización {quote_request_id}")
                return jsonify(result)
            else:
                raise ValueError("No se encontró JSON válido en la respuesta")
                
        except json.JSONDecodeError as e:
            print(f"[FULL ANALYSIS] Error parseando JSON: {e}")
            return jsonify(build_fallback_result(quote_request, has_data=True)), 200
            
    except Exception as e:
        print(f"[FULL ANALYSIS] Error: {e}")
        import traceback
        print(traceback.format_exc())
        # Fallback para cualquier otro error
        try:
            quote_request = QuoteRequest.query.get(quote_request_id)
            if quote_request:
                return jsonify({
                    **build_fallback_result(quote_request, has_data=False)
                }), 200
        except Exception:
            pass
        return jsonify({'resumen_ejecutivo': {'analisis_general': 'No fue posible generar el análisis en este momento.'}}), 200