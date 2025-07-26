#!/usr/bin/env python3
"""
Script para asignar categorías a los servicios existentes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, Service, Category

def fix_service_categories():
    app = create_app()
    
    with app.app_context():
        print("Asignando categorías a servicios...")
        
        # Mapeo de servicios a categorías existentes
        service_category_mapping = {
            "Mantenimiento Preventivo de Bombas": "Bombas Centrífugas",
            "Instalación de Sistemas de Filtración": "Sistemas de Filtración",
            "Capacitación en Seguridad Industrial": "Seguridad Industrial (EPP)",
            "Reparación de Equipos de Perforación": "Equipos de Perforación",
            "Calibración de Instrumentos": "Instrumentación y Medición"
        }
        
        # Obtener todas las categorías
        categories = {cat.name: cat.id for cat in Category.query.all()}
        print(f"Categorías disponibles: {list(categories.keys())}")
        
        # Actualizar servicios
        services = Service.query.all()
        updated_count = 0
        
        for service in services:
            if service.name in service_category_mapping:
                category_name = service_category_mapping[service.name]
                if category_name in categories:
                    service.category_id = categories[category_name]
                    updated_count += 1
                    print(f"✅ Asignada categoría '{category_name}' a '{service.name}'")
                else:
                    print(f"⚠️ Categoría '{category_name}' no encontrada para '{service.name}'")
            else:
                print(f"⚠️ No hay mapeo para servicio: '{service.name}'")
        
        db.session.commit()
        print(f"\n✅ Actualizados {updated_count} servicios con categorías")
        
        # Verificar resultado
        print("\nVerificación final:")
        services = Service.query.all()
        for service in services:
            category_name = service.category.name if service.category else "Sin categoría"
            print(f"Servicio {service.id}: {service.name} - Categoría: {category_name}")

if __name__ == "__main__":
    fix_service_categories() 