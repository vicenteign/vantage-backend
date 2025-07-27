from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return jsonify({"message": "Bienvenido al API de Vantage.ai"})

@main_bp.route('/health')
def health():
    return jsonify({"status": "healthy", "message": "Backend funcionando correctamente"}) 