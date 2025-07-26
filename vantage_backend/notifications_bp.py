from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from .models import db, User, Notification, QuoteRequest, Product, Service, ClientCompany, ClientBranch
from sqlalchemy import and_

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/provider/notifications', methods=['GET'])
@jwt_required()
def get_provider_notifications():
    """Obtener notificaciones del proveedor"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'proveedor':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        # Obtener notificaciones del proveedor
        notifications = Notification.query.filter_by(
            recipient_id=user_id
        ).order_by(Notification.created_at.desc()).limit(50).all()
        
        notifications_data = []
        for notification in notifications:
            notification_data = {
                'id': notification.id,
                'type': notification.type,
                'title': notification.title,
                'message': notification.message,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'data': notification.data
            }
            notifications_data.append(notification_data)
        
        return jsonify({
            'notifications': notifications_data,
            'unread_count': len([n for n in notifications if not n.is_read])
        })
        
    except Exception as e:
        print(f"Error getting notifications: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@notifications_bp.route('/provider/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    """Marcar una notificación como leída"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'proveedor':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        notification = Notification.query.filter_by(
            id=notification_id,
            recipient_id=user_id
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notificación no encontrada'}), 404
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Notificación marcada como leída'})
        
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@notifications_bp.route('/provider/notifications/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_as_read():
    """Marcar todas las notificaciones como leídas"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'proveedor':
            return jsonify({'error': 'Acceso denegado'}), 403
        
        # Marcar todas las notificaciones no leídas como leídas
        unread_notifications = Notification.query.filter_by(
            recipient_id=user_id,
            is_read=False
        ).all()
        
        for notification in unread_notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(unread_notifications)} notificaciones marcadas como leídas'
        })
        
    except Exception as e:
        print(f"Error marking all notifications as read: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

def create_quote_request_notification(quote_request_id):
    """Crear notificación para una nueva solicitud de cotización"""
    try:
        quote_request = QuoteRequest.query.get(quote_request_id)
        if not quote_request:
            return
        
        # Obtener información del cliente
        client_company = ClientCompany.query.get(quote_request.client_company_id)
        client_branch = ClientBranch.query.get(quote_request.client_branch_id) if quote_request.client_branch_id else None
        
        # Obtener información del item
        item_name = ""
        if quote_request.item_type == 'producto':
            product = Product.query.get(quote_request.item_id)
            item_name = product.name if product else "Producto"
        elif quote_request.item_type == 'servicio':
            service = Service.query.get(quote_request.item_id)
            item_name = service.name if service else "Servicio"
        
        # Crear notificación
        notification = Notification(
            recipient_id=quote_request.provider_id,
            type='quote_request',
            title='Nueva solicitud de cotización',
            message=f'Nueva solicitud de cotización para {item_name}',
            is_read=False,
            data={
                'quote_id': quote_request.id,
                'item_name': item_name,
                'client_name': client_company.name if client_company else 'Cliente',
                'quantity': quote_request.quantity,
                'message': quote_request.message
            }
        )
        
        db.session.add(notification)
        db.session.commit()
        
    except Exception as e:
        print(f"Error creating quote request notification: {e}")
        db.session.rollback()

def create_system_notification(user_id, title, message, data=None):
    """Crear notificación del sistema"""
    try:
        notification = Notification(
            recipient_id=user_id,
            type='system',
            title=title,
            message=message,
            is_read=False,
            data=data or {}
        )
        
        db.session.add(notification)
        db.session.commit()
        
    except Exception as e:
        print(f"Error creating system notification: {e}")
        db.session.rollback() 