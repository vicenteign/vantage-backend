#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User, ProviderProfile
from flask_bcrypt import Bcrypt

def create_test_user():
    app = create_app()
    bcrypt = Bcrypt()
    
    with app.app_context():
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email='test@example.com').first()
        if existing_user:
            print("Usuario de prueba ya existe")
            return
        
        # Crear usuario de prueba
        hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
        
        new_user = User(
            email='test@example.com',
            password_hash=hashed_password,
            full_name='Usuario de Prueba',
            role='proveedor'
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Crear perfil del proveedor
        new_profile = ProviderProfile(
            user_id=new_user.id,
            company_name='Empresa de Prueba'
        )
        db.session.add(new_profile)
        db.session.commit()
        
        print(f"Usuario de prueba creado:")
        print(f"Email: test@example.com")
        print(f"Password: password123")
        print(f"User ID: {new_user.id}")

if __name__ == '__main__':
    create_test_user() 