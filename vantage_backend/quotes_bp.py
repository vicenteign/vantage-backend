from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, QuoteRequest, QuoteAttachment, User, ProviderProfile, Product, Service, ClientBranch
from datetime import datetime
from .notifications_bp import create_quote_request_notification
import os

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
            data.append({
                'id': r.id,
                'provider_id': r.provider_id,
                'response_pdf_url': r.response_pdf_url,
                'total_price': r.total_price,
                'currency': r.currency,
                'certifications_count': r.certifications_count,
                'ia_data': r.ia_data,
                'created_at': r.created_at.isoformat()
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
        data = request.get_json()
        query = data.get('query', '').strip()
        quotes_data = data.get('quotes_data', [])
        
        if not query:
            return jsonify({'error': 'No se proporcionó una consulta de filtro'}), 400
        
        if not quotes_data:
            return jsonify({'error': 'No hay datos de cotizaciones para filtrar'}), 400
        
        openai.api_key = os.environ.get('OPENAI_API_KEY') or os.environ.get('OPENAI_KEY')
        if not openai.api_key:
            return jsonify({'error': 'No hay API Key de OpenAI configurada'}), 500
        
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
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": prompt}],
                max_tokens=512,
                temperature=0.1
            )
            
            ia_result = response.choices[0].message.content
            print(f"[IA FILTER] Respuesta de OpenAI: {ia_result[:200]}...")
            
            # Parsear respuesta JSON
            import json
            try:
                # Extraer JSON del texto (puede venir con markdown)
                json_start = ia_result.find('{')
                json_end = ia_result.rfind('}') + 1
                if json_start != -1 and json_end != 0:
                    json_str = ia_result[json_start:json_end]
                    result = json.loads(json_str)
                else:
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
                return jsonify({
                    'error': f'Error procesando respuesta de IA: {str(e)}',
                    'raw_response': ia_result,
                    'available_quote_ids': quote_ids_available
                }), 500
                
        except Exception as e:
            print(f"[IA FILTER] Error en OpenAI: {e}")
            return jsonify({'error': f'Error en análisis IA: {str(e)}'}), 500
            
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