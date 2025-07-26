#!/usr/bin/env python3
"""
Script simple para crear cotizaciones de prueba
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User, ProviderProfile, QuoteRequest

def create_quotes():
    app = create_app()
    
    with app.app_context():
        print("Creating quote requests...")
        
        # Get existing users
        client1 = User.query.filter_by(email="cliente1@mineraandes.cl").first()
        client2 = User.query.filter_by(email="cliente2@mineraoriente.cl").first()
        client3 = User.query.filter_by(email="cliente3@mineracobre.cl").first()
        
        provider1 = User.query.filter_by(email="juan.perez@solucioneshidraulicas.cl").first()
        provider2 = User.query.filter_by(email="carlos.rodriguez@seguridadtotal.cl").first()
        provider3 = User.query.filter_by(email="ana.martinez@drilltech.cl").first()
        
        provider_profile1 = ProviderProfile.query.filter_by(user_id=provider1.id).first()
        provider_profile2 = ProviderProfile.query.filter_by(user_id=provider2.id).first()
        provider_profile3 = ProviderProfile.query.filter_by(user_id=provider3.id).first()
        
        quote_requests = [
            {
                "client_user_id": client1.id,
                "provider_id": provider_profile1.id,
                "item_id": 1,
                "item_type": "producto",
                "item_name_snapshot": "Bomba Centrífuga Multietapa X-5000",
                "quantity": 2,
                "message": "Necesito cotización para 2 bombas centrífugas multietapa para proyecto minero. Requiero especificaciones técnicas detalladas y tiempo de entrega."
            },
            {
                "client_user_id": client1.id,
                "provider_id": provider_profile1.id,
                "item_id": 1,
                "item_type": "servicio",
                "item_name_snapshot": "Mantenimiento Preventivo de Bombas",
                "quantity": 1,
                "message": "Solicito cotización para mantenimiento preventivo de 5 bombas centrífugas en nuestras instalaciones. Incluir inspección y reporte técnico."
            },
            {
                "client_user_id": client2.id,
                "provider_id": provider_profile2.id,
                "item_id": 1,
                "item_type": "producto",
                "item_name_snapshot": "Casco de Seguridad Minero con Barbiquejo",
                "quantity": 50,
                "message": "Cotización para 50 cascos de seguridad minero con barbiquejo. Requiero certificación ANSI y entrega en 2 semanas."
            },
            {
                "client_user_id": client2.id,
                "provider_id": provider_profile2.id,
                "item_id": 1,
                "item_type": "servicio",
                "item_name_snapshot": "Capacitación en Seguridad Industrial",
                "quantity": 1,
                "message": "Necesito capacitación en seguridad industrial para 25 trabajadores. Incluir materiales y certificados de participación."
            },
            {
                "client_user_id": client3.id,
                "provider_id": provider_profile3.id,
                "item_id": 1,
                "item_type": "producto",
                "item_name_snapshot": "Broca de Diamante Policristalino (PDC) 8.5\"",
                "quantity": 3,
                "message": "Cotización para 3 brocas de diamante PDC 8.5 pulgadas. Especificar durabilidad estimada y garantía."
            }
        ]
        
        for quote_data in quote_requests:
            quote_request = QuoteRequest(**quote_data)
            db.session.add(quote_request)
        
        db.session.commit()
        print(f"Created {len(quote_requests)} quote requests successfully!")
        
        # Print summary
        print(f"\nQuote Requests: {QuoteRequest.query.count()}")

if __name__ == "__main__":
    create_quotes() 