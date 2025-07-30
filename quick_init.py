#!/usr/bin/env python3

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User, ProviderProfile, ClientCompany, Category, Product, Service, Plan
from flask_bcrypt import Bcrypt

def quick_init():
    app = create_app()
    bcrypt = Bcrypt(app)
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✅ Tables created successfully!")
        
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
        print("✅ Categories created!")
        
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
        print("✅ Plans created!")
        
        # Create test users
        print("Creating test users...")
        
        # Create provider user
        provider_password = bcrypt.generate_password_hash("password123").decode('utf-8')
        provider_user = User(
            email="juan.perez@solucioneshidraulicas.cl",
            password_hash=provider_password,
            full_name="Juan Pérez",
            role="proveedor"
        )
        db.session.add(provider_user)
        db.session.flush()
        
        # Create provider profile
        provider_profile = ProviderProfile(
            user_id=provider_user.id,
            company_name="Soluciones Hidráulicas del Pacífico",
            about_us="Especialistas en sistemas hidráulicos y bombas industriales",
            website_url="https://www.solucioneshidraulicas.cl"
        )
        db.session.add(provider_profile)
        
        # Create client user
        client_password = bcrypt.generate_password_hash("password123").decode('utf-8')
        client_user = User(
            email="cliente1@mineraandes.cl",
            password_hash=client_password,
            full_name="Cliente Test 1",
            role="cliente"
        )
        db.session.add(client_user)
        db.session.flush()
        
        # Create client company
        client_company = ClientCompany(
            company_name="Minera Andes",
            industry="Minería",
            about_us="Empresa minera líder en extracción de cobre"
        )
        db.session.add(client_company)
        db.session.flush()
        
        # Update user with company_id
        client_user.company_id = client_company.id
        
        db.session.commit()
        print("✅ Users created!")
        
        # Create a test product
        print("Creating test products...")
        category = Category.query.filter_by(name="Bombas Centrífugas").first()
        
        product = Product(
            provider_id=provider_profile.id,
            category_id=category.id,
            name="Bomba Centrífuga Multietapa X-5000",
            description="Bomba de alta presión diseñada para el bombeo de fluidos con sólidos en suspensión.",
            technical_details="Caudal: 500 m³/h. Altura manométrica: 300m. Material: Acero inoxidable 316L.",
            sku="SHP-BC-5000",
            status="activo",
            is_featured=True
        )
        db.session.add(product)
        
        # Create a test service
        print("Creating test services...")
        service = Service(
            provider_id=provider_profile.id,
            name="Mantenimiento Preventivo de Bombas",
            description="Servicio de mantenimiento preventivo para bombas centrífugas y de pistón.",
            modality="4-8 horas, $500.000 - $1.200.000",
            category_id=category.id,
            status="activo",
            is_featured=True
        )
        db.session.add(service)
        
        db.session.commit()
        print("✅ Products and services created!")
        
        # Print summary
        print(f"\n🎉 Database initialized successfully!")
        print(f"📊 Summary:")
        print(f"- Categories: {Category.query.count()}")
        print(f"- Plans: {Plan.query.count()}")
        print(f"- Users: {User.query.count()}")
        print(f"- Provider Profiles: {ProviderProfile.query.count()}")
        print(f"- Client Companies: {ClientCompany.query.count()}")
        print(f"- Products: {Product.query.count()}")
        print(f"- Services: {Service.query.count()}")
        print(f"- Featured Products: {Product.query.filter_by(is_featured=True).count()}")
        print(f"- Featured Services: {Service.query.filter_by(is_featured=True).count()}")
        
        print(f"\n👥 Test Users:")
        print(f"- Provider: juan.perez@solucioneshidraulicas.cl / password123")
        print(f"- Client: cliente1@mineraandes.cl / password123")

if __name__ == "__main__":
    quick_init() 