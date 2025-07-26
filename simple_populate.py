#!/usr/bin/env python3
"""
Script simple para poblar la base de datos de Vantage.ai con datos de prueba
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User, ProviderProfile, ClientCompany, Category, Product, Service, Plan, QuoteRequest
from flask_bcrypt import Bcrypt
from datetime import datetime

def populate_database():
    app = create_app()
    bcrypt = Bcrypt(app)
    
    with app.app_context():
        # Create tables if they don't exist
        print("Creating tables if they don't exist...")
        db.create_all()
        
        # Check if data already exists
        if User.query.count() > 0:
            print("Database already has data. Clearing and repopulating...")
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
            }
        ]
        
        for provider_data in providers:
            hashed_password = bcrypt.generate_password_hash(provider_data["password"]).decode('utf-8')
            user = User(
                email=provider_data["email"],
                password=hashed_password,
                full_name=provider_data["full_name"],
                role=provider_data["role"]
            )
            db.session.add(user)
            db.session.flush()  # Get the user ID
            
            profile = ProviderProfile(
                user_id=user.id,
                company_name=provider_data["company_name"],
                about_us=provider_data["about_us"],
                website_url=provider_data["website_url"]
            )
            db.session.add(profile)
        
        db.session.commit()
        
        # Create client users and companies
        print("Creating client users...")
        clients = [
            {
                "email": "cliente1@mineraandes.cl",
                "password": "password123",
                "full_name": "María González",
                "role": "cliente",
                "company_name": "Minera Andes del Sur",
                "industry": "Minería",
                "company_size": "Grande"
            },
            {
                "email": "cliente2@mineraoriente.cl",
                "password": "password123",
                "full_name": "Roberto Silva",
                "role": "cliente",
                "company_name": "Minera Oriente",
                "industry": "Minería",
                "company_size": "Mediana"
            },
            {
                "email": "cliente3@mineracobre.cl",
                "password": "password123",
                "full_name": "Patricia Vega",
                "role": "cliente",
                "company_name": "Minera Cobre del Norte",
                "industry": "Minería",
                "company_size": "Grande"
            }
        ]
        
        for client_data in clients:
            hashed_password = bcrypt.generate_password_hash(client_data["password"]).decode('utf-8')
            user = User(
                email=client_data["email"],
                password=hashed_password,
                full_name=client_data["full_name"],
                role=client_data["role"]
            )
            db.session.add(user)
            db.session.flush()  # Get the user ID
            
            company = ClientCompany(
                user_id=user.id,
                company_name=client_data["company_name"],
                industry=client_data["industry"],
                company_size=client_data["company_size"]
            )
            db.session.add(company)
        
        db.session.commit()
        
        # Create products
        print("Creating products...")
        products = [
            {
                "name": "Bomba Centrífuga Multietapa X-5000",
                "description": "Bomba centrífuga multietapa de alta presión para aplicaciones industriales",
                "price": 2500000,
                "category_id": 1,
                "provider_id": 1,
                "is_featured": True
            },
            {
                "name": "Casco de Seguridad Minero con Barbiquejo",
                "description": "Casco de seguridad certificado ANSI para minería",
                "price": 45000,
                "category_id": 3,
                "provider_id": 2,
                "is_featured": True
            },
            {
                "name": "Broca de Diamante Policristalino (PDC) 8.5\"",
                "description": "Broca PDC de alta durabilidad para perforación",
                "price": 850000,
                "category_id": 2,
                "provider_id": 3,
                "is_featured": False
            }
        ]
        
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
        
        db.session.commit()
        
        # Create services
        print("Creating services...")
        services = [
            {
                "name": "Mantenimiento Preventivo de Bombas",
                "description": "Servicio de mantenimiento preventivo para bombas industriales",
                "price": 350000,
                "category_id": 1,
                "provider_id": 1,
                "is_featured": True
            },
            {
                "name": "Capacitación en Seguridad Industrial",
                "description": "Capacitación completa en seguridad industrial y EPP",
                "price": 250000,
                "category_id": 3,
                "provider_id": 2,
                "is_featured": False
            },
            {
                "name": "Reparación de Equipos de Perforación",
                "description": "Servicio de reparación y mantenimiento de equipos de perforación",
                "price": 500000,
                "category_id": 2,
                "provider_id": 3,
                "is_featured": True
            }
        ]
        
        for service_data in services:
            service = Service(**service_data)
            db.session.add(service)
        
        db.session.commit()
        
        print("Database populated successfully!")
        print(f"Categories: {Category.query.count()}")
        print(f"Plans: {Plan.query.count()}")
        print(f"Users: {User.query.count()}")
        print(f"Products: {Product.query.count()}")
        print(f"Services: {Service.query.count()}")

if __name__ == "__main__":
    populate_database() 