#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User, ClientCompany
from flask_bcrypt import Bcrypt

def create_test_client():
    app = create_app()
    bcrypt = Bcrypt()
    
    with app.app_context():
        # Verificar si el cliente ya existe
        existing_user = User.query.filter_by(email='cliente@example.com').first()
        if existing_user:
            print("Cliente de prueba ya existe")
            return
        
        # Crear empresa cliente
        company = ClientCompany(
            company_name='Empresa Cliente de Prueba',
            industry='Tecnología',
            about_us='Empresa cliente para testing'
        )
        db.session.add(company)
        db.session.flush()
        
        # Crear usuario cliente
        hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
        
        new_user = User(
            email='cliente@example.com',
            password_hash=hashed_password,
            full_name='Cliente de Prueba',
            role='cliente',
            company_id=company.id
        )
        db.session.add(new_user)
        db.session.commit()
        
        print(f"Cliente de prueba creado:")
        print(f"Email: cliente@example.com")
        print(f"Password: password123")
        print(f"User ID: {new_user.id}")
        print(f"Company ID: {company.id}")

if __name__ == '__main__':
    create_test_client() 