#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vantage_backend import create_app
from vantage_backend.models import db, User
from flask_bcrypt import Bcrypt

def fix_passwords():
    app = create_app()
    bcrypt = Bcrypt(app)
    
    with app.app_context():
        # List of users to fix with their passwords
        users_to_fix = [
            ("admin@vantage.ai", "admin123"),
            ("juan.perez@solucioneshidraulicas.cl", "password123"),
            ("maria.gonzalez@mineraandes.cl", "password123"),
            ("carlos.rodriguez@seguridadtotal.cl", "password123"),
            ("ana.martinez@drilltech.cl", "password123"),
            ("roberto.silva@tecmaq.cl", "password123"),
            ("patricia.vega@metricon.cl", "password123"),
            ("cliente1@mineraandes.cl", "password123"),
            ("cliente2@mineraoriente.cl", "password123"),
            ("cliente3@mineracobre.cl", "password123"),
            ("cliente4@minerazinc.cl", "password123"),
            ("cliente5@minerafosfato.cl", "password123")
        ]
        
        for email, password in users_to_fix:
            user = User.query.filter_by(email=email).first()
            if user:
                # Hash the password properly with Flask-Bcrypt
                password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
                user.password_hash = password_hash
                print(f"Fixed password for {email}")
            else:
                print(f"User {email} not found")
        
        db.session.commit()
        print("All passwords fixed successfully!")

if __name__ == "__main__":
    fix_passwords() 