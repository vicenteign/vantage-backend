from flask import request, jsonify, Blueprint
from .models import db, User
from flask_jwt_extended import jwt_required, get_jwt_identity

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/users/complete-onboarding', methods=['PUT'])
@jwt_required()
def complete_onboarding():
    """Endpoint para marcar el onboarding como completado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        # Marcar onboarding como completado
        user.has_completed_onboarding = True
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Onboarding completado exitosamente"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Error al completar onboarding",
            "error": str(e)
        }), 500

@api_bp.route('/users/onboarding-status', methods=['GET'])
@jwt_required()
def get_onboarding_status():
    """Endpoint para obtener el estado del onboarding del usuario"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        return jsonify({
            "success": True,
            "has_completed_onboarding": user.has_completed_onboarding,
            "user_role": user.role
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error al obtener estado de onboarding",
            "error": str(e)
        }), 500

@api_bp.route('/users/reset-onboarding', methods=['PUT'])
@jwt_required()
def reset_onboarding():
    """Endpoint para resetear el onboarding (solo para desarrollo)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
        
        # Marcar onboarding como no completado
        user.has_completed_onboarding = False
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Onboarding reseteado exitosamente"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Error al resetear onboarding",
            "error": str(e)
        }), 500 