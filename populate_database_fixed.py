#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User, ProviderProfile, ClientCompany, Category, Product, Service, Plan
from flask_bcrypt import Bcrypt
from datetime import datetime

def populate_database():
    app = create_app()
    bcrypt = Bcrypt(app)
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Create categories
        print("Creating categories...")
        categories = [
            Category(name="Bombas y Tuberías"),
            Category(name="Equipos de Perforación"),
            Category(name="Seguridad Industrial (EPP)"),
            Category(name="Herramientas Manuales"),
            Category(name="Equipos de Soldadura"),
            Category(name="Bombas Centrífugas"),
            Category(name="Vehículos y Maquinaria Pesada"),
            Category(name="Sistemas de Filtración"),
            Category(name="Equipos de Laboratorio"),
            Category(name="Sistemas de Control"),
            Category(name="Instrumentación y Medición"),
            Category(name="Equipos de Comunicación")
        ]
        
        for category in categories:
            db.session.add(category)
        db.session.commit()
        
        # Create plans
        print("Creating plans...")
        plans = [
            Plan(name="Básico", product_limit=10, service_limit=5),
            Plan(name="Profesional", product_limit=50, service_limit=25),
            Plan(name="Empresarial", product_limit=200, service_limit=100)
        ]
        
        for plan in plans:
            db.session.add(plan)
        db.session.commit()
        
        # Create provider users and profiles
        print("Creating provider users...")
        providers = [
            {
                "email": "juan.perez@solucioneshidraulicas.cl",
                "password": "password123",
                "full_name": "Juan Pérez",
                "role": "proveedor",
                "company_name": "Soluciones Hidráulicas del Pacífico",
                "about_us": "Especialistas en sistemas hidráulicos y bombas industriales",
                "website_url": "https://www.solucioneshidraulicas.cl"
            },
            {
                "email": "carlos.rodriguez@seguridadtotal.cl",
                "password": "password123",
                "full_name": "Carlos Rodríguez",
                "role": "proveedor",
                "company_name": "Seguridad Total Ltda.",
                "about_us": "Proveedor líder en equipos de protección personal",
                "website_url": "https://www.seguridadtotal.cl"
            },
            {
                "email": "ana.martinez@drilltech.cl",
                "password": "password123",
                "full_name": "Ana Martínez",
                "role": "proveedor",
                "company_name": "Drilltech Ingeniería",
                "about_us": "Especialistas en equipos de perforación y herramientas",
                "website_url": "https://www.drilltech.cl"
            },
            {
                "email": "roberto.silva@tecmaq.cl",
                "password": "password123",
                "full_name": "Roberto Silva",
                "role": "proveedor",
                "company_name": "TECMAQ Maquinarias",
                "about_us": "Distribuidor autorizado de maquinaria pesada",
                "website_url": "https://www.tecmaq.cl"
            },
            {
                "email": "patricia.vega@metricon.cl",
                "password": "password123",
                "full_name": "Patricia Vega",
                "role": "proveedor",
                "company_name": "Metrología y Control (MetriCon)",
                "about_us": "Especialistas en instrumentación y control industrial",
                "website_url": "https://www.metricon.cl"
            }
        ]
        
        for provider_data in providers:
            # Create user
            password_hash = bcrypt.generate_password_hash(provider_data["password"]).decode('utf-8')
            user = User(
                email=provider_data["email"],
                password_hash=password_hash,
                full_name=provider_data["full_name"],
                role=provider_data["role"]
            )
            db.session.add(user)
            db.session.flush()  # Get the user ID
            
            # Create provider profile
            profile = ProviderProfile(
                user_id=user.id,
                company_name=provider_data["company_name"],
                about_us=provider_data["about_us"],
                website_url=provider_data["website_url"]
            )
            db.session.add(profile)
        
        # Create client users and companies
        print("Creating client users...")
        clients = [
            {
                "email": "maria.gonzalez@mineraandes.cl",
                "password": "password123",
                "full_name": "María González",
                "role": "cliente",
                "company_name": "Minera Andes",
                "industry": "Minería",
                "about_us": "Empresa minera líder en extracción de cobre"
            },
            {
                "email": "cliente1@mineraandes.cl",
                "password": "password123",
                "full_name": "Cliente Test 1",
                "role": "cliente",
                "company_name": "Minera Andes",
                "industry": "Minería",
                "about_us": "Empresa minera líder en extracción de cobre"
            },
            {
                "email": "cliente2@mineraoriente.cl",
                "password": "password123",
                "full_name": "Cliente Test 2",
                "role": "cliente",
                "company_name": "Minera Oriente",
                "industry": "Minería",
                "about_us": "Empresa minera especializada en oro"
            },
            {
                "email": "cliente3@mineracobre.cl",
                "password": "password123",
                "full_name": "Cliente Test 3",
                "role": "cliente",
                "company_name": "Minera Cobre",
                "industry": "Minería",
                "about_us": "Empresa minera de cobre"
            }
        ]
        
        for client_data in clients:
            # Create user
            password_hash = bcrypt.generate_password_hash(client_data["password"]).decode('utf-8')
            user = User(
                email=client_data["email"],
                password_hash=password_hash,
                full_name=client_data["full_name"],
                role=client_data["role"]
            )
            db.session.add(user)
            db.session.flush()  # Get the user ID
            
            # Create client company
            company = ClientCompany(
                company_name=client_data["company_name"],
                industry=client_data["industry"],
                about_us=client_data["about_us"]
            )
            db.session.add(company)
            db.session.flush()  # Get the company ID
            
            # Update user with company_id
            user.company_id = company.id
        
        db.session.commit()
        
        # Create products
        print("Creating products...")
        products = [
            {
                "name": "Bomba Centrífuga Multietapa X-5000",
                "description": "Bomba de alta presión diseñada para el bombeo de fluidos con sólidos en suspensión, ideal para pulpa de mineral.",
                "technical_details": "Caudal: 500 m³/h. Altura manométrica: 300m. Material: Acero inoxidable 316L.",
                "sku": "SHP-BC-5000",
                "status": "activo",
                "provider_email": "juan.perez@solucioneshidraulicas.cl",
                "category_name": "Bombas Centrífugas"
            },
            {
                "name": "Tubería de HDPE 12 pulgadas",
                "description": "Tubería de Polietileno de Alta Densidad (HDPE) resistente a la abrasión y la corrosión.",
                "technical_details": "Diámetro: 12 pulgadas (315mm). Presión nominal: PN10. Largo: Tramos de 12 metros.",
                "sku": "SHP-HDPE-12",
                "status": "activo",
                "provider_email": "juan.perez@solucioneshidraulicas.cl",
                "category_name": "Bombas y Tuberías"
            },
            {
                "name": "Casco de Seguridad Minero con Barbiquejo",
                "description": "Casco de seguridad tipo I clase E, con sistema de ajuste ratchet y barbiquejo de 4 puntos.",
                "technical_details": "Material: ABS de alto impacto. Certificación: ANSI Z89.1-2014.",
                "sku": "ST-CSM-01B",
                "status": "activo",
                "provider_email": "carlos.rodriguez@seguridadtotal.cl",
                "category_name": "Seguridad Industrial (EPP)"
            },
            {
                "name": "Broca de Diamante Policristalino (PDC) 8.5\"",
                "description": "Broca de alta velocidad y durabilidad para perforaciones en formaciones rocosas de dureza media a alta.",
                "technical_details": "Tamaño de cortador: 19mm. Conexión: 4 1/2 API Reg Pin. Número de cortadores: 7.",
                "sku": "DT-PDC-85",
                "status": "activo",
                "provider_email": "ana.martinez@drilltech.cl",
                "category_name": "Equipos de Perforación"
            },
            {
                "name": "Excavadora Hidráulica 336D2L",
                "description": "Excavadora de 36 toneladas, ideal para movimiento de tierra masivo y trabajos de construcción pesada. Motor C9 ACERT.",
                "technical_details": "Potencia neta: 268 hp. Capacidad del cucharón: 1.88 m³. Profundidad de excavación: 7.5 m.",
                "sku": "TM-EXC-336",
                "status": "activo",
                "provider_email": "roberto.silva@tecmaq.cl",
                "category_name": "Vehículos y Maquinaria Pesada"
            },
            {
                "name": "Flujómetro Magnético para Líquidos Corrosivos",
                "description": "Medidor de flujo electromagnético con revestimiento de teflón (PTFE), ideal para ácidos y otros químicos.",
                "technical_details": "Rango de medición: 0.1 a 10 m/s. Precisión: ±0.5%. Salida: 4-20mA + HART.",
                "sku": "MC-FMAG-C800",
                "status": "activo",
                "provider_email": "patricia.vega@metricon.cl",
                "category_name": "Instrumentación y Medición"
            },
            {
                "name": "Sensor de Presión Diferencial para Filtros",
                "description": "Transmisor de presión diferencial para monitorear la saturación de filtros de aire y líquidos en tiempo real.",
                "technical_details": "Rango: 0-2500 Pa. Material del diafragma: Acero inoxidable 316L. Protección: IP67.",
                "sku": "MC-SPD-F25",
                "status": "activo",
                "provider_email": "patricia.vega@metricon.cl",
                "category_name": "Instrumentación y Medición"
            }
        ]
        
        for product_data in products:
            # Get provider and category
            user = User.query.filter_by(email=product_data["provider_email"]).first()
            provider_profile = ProviderProfile.query.filter_by(user_id=user.id).first()
            category = Category.query.filter_by(name=product_data["category_name"]).first()
            
            product = Product(
                provider_id=provider_profile.id,
                category_id=category.id,
                name=product_data["name"],
                description=product_data["description"],
                technical_details=product_data["technical_details"],
                sku=product_data["sku"],
                status=product_data["status"]
            )
            db.session.add(product)
        
        # Create services
        print("Creating services...")
        services = [
            {
                "name": "Mantenimiento Preventivo de Bombas",
                "description": "Servicio de mantenimiento preventivo para bombas centrífugas y de pistón.",
                "category_name": "Bombas Centrífugas",
                "modality": "4-8 horas, $500.000 - $1.200.000",
                "status": "activo",
                "provider_email": "juan.perez@solucioneshidraulicas.cl"
            },
            {
                "name": "Instalación de Sistemas de Filtración",
                "description": "Instalación y puesta en marcha de sistemas de filtración industrial.",
                "category_name": "Sistemas de Filtración",
                "modality": "2-5 días, $2.000.000 - $5.000.000",
                "status": "activo",
                "provider_email": "juan.perez@solucioneshidraulicas.cl"
            },
            {
                "name": "Capacitación en Seguridad Industrial",
                "description": "Capacitación en uso correcto de EPP y protocolos de seguridad.",
                "category_name": "Seguridad Industrial (EPP)",
                "modality": "8 horas, $800.000 - $1.500.000",
                "status": "activo",
                "provider_email": "carlos.rodriguez@seguridadtotal.cl"
            },
            {
                "name": "Reparación de Equipos de Perforación",
                "description": "Servicio de reparación y mantenimiento de equipos de perforación.",
                "category_name": "Equipos de Perforación",
                "modality": "1-3 días, $1.500.000 - $3.000.000",
                "status": "activo",
                "provider_email": "ana.martinez@drilltech.cl"
            },
            {
                "name": "Calibración de Instrumentos",
                "description": "Servicio de calibración de instrumentos de medición y control.",
                "category_name": "Instrumentación y Medición",
                "modality": "1-2 días, $300.000 - $800.000",
                "status": "activo",
                "provider_email": "patricia.vega@metricon.cl"
            }
        ]
        
        for service_data in services:
            user = User.query.filter_by(email=service_data["provider_email"]).first()
            provider_profile = ProviderProfile.query.filter_by(user_id=user.id).first()
            category = Category.query.filter_by(name=service_data["category_name"]).first()
            service = Service(
                provider_id=provider_profile.id,
                name=service_data["name"],
                description=service_data["description"],
                modality=service_data["modality"],
                category_id=category.id,
                status=service_data["status"]
            )
            db.session.add(service)
        
        db.session.commit()
        print("Database populated successfully!")
        
        # Mark some products and services as featured
        print("Marking featured items...")
        
        # Mark some products as featured
        featured_product_skus = ["SHP-BC-5000", "DT-PDC-85", "MC-FMAG-C800"]
        for sku in featured_product_skus:
            product = Product.query.filter_by(sku=sku).first()
            if product:
                product.is_featured = True
                print(f"Marked product {product.name} as featured")
        
        # Mark some services as featured
        featured_service_names = ["Mantenimiento Preventivo de Bombas", "Capacitación en Seguridad Industrial"]
        for name in featured_service_names:
            service = Service.query.filter_by(name=name).first()
            if service:
                service.is_featured = True
                print(f"Marked service {service.name} as featured")
        
        db.session.commit()
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Categories: {Category.query.count()}")
        print(f"- Plans: {Plan.query.count()}")
        print(f"- Users: {User.query.count()}")
        print(f"- Provider Profiles: {ProviderProfile.query.count()}")
        print(f"- Client Companies: {ClientCompany.query.count()}")
        print(f"- Products: {Product.query.count()}")
        print(f"- Services: {Service.query.count()}")
        print(f"- Featured Products: {Product.query.filter_by(is_featured=True).count()}")
        print(f"- Featured Services: {Service.query.filter_by(is_featured=True).count()}")

if __name__ == "__main__":
    populate_database() 