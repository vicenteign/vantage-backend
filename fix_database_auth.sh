#!/bin/bash

# Script para corregir autenticación de PostgreSQL y configurar base de datos
echo "🔧 Corrigiendo autenticación de PostgreSQL..."

# 1. Verificar variables de entorno de PostgreSQL
echo "📋 Verificando configuración de PostgreSQL..."
docker-compose -f docker-compose.ec2.yml exec postgres env | grep POSTGRES

# 2. Recrear usuario con permisos correctos
echo "👤 Recreando usuario vantage_user..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d postgres -c "
DROP USER IF EXISTS vantage_user;
CREATE USER vantage_user WITH PASSWORD 'vantage_password_secure';
GRANT ALL PRIVILEGES ON DATABASE vantageai TO vantage_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vantage_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vantage_user;
ALTER USER vantage_user CREATEDB;
"

# 3. Verificar que la base de datos existe
echo "🗄️ Verificando base de datos vantageai..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "SELECT 1;" 2>/dev/null || {
    echo "📝 Creando base de datos vantageai..."
    docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d postgres -c "CREATE DATABASE vantageai;"
}

# 4. Probar conexión desde el backend
echo "🔍 Probando conexión desde el backend..."
docker-compose -f docker-compose.ec2.yml exec backend python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://vantage_user:vantage_password_secure@postgres:5432/vantageai')
    print('✅ Conexión exitosa a PostgreSQL')
    cursor = conn.cursor()
    cursor.execute('SELECT current_database();')
    db = cursor.fetchone()
    print(f'🗄️ Base de datos: {db[0]}')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'❌ Error de conexión: {e}')
"

# 5. Copiar archivo de población si no existe
echo "📁 Copiando archivo de población..."
if [ ! -f "populate_database_fixed.py" ]; then
    echo "❌ Archivo populate_database_fixed.py no encontrado"
    echo "📋 Creando archivo de población básico..."
    cat > populate_database_fixed.py << 'EOF'
#!/usr/bin/env python3
import sys
import os
sys.path.append('/app')

from vantage_backend import create_app
from vantage_backend.models import db, User, Product, Service, Category
from flask_bcrypt import Bcrypt

app = create_app()
bcrypt = Bcrypt(app)

def create_test_data():
    with app.app_context():
        print("🔄 Creando datos de prueba...")
        
        # Crear usuarios de prueba
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@vantage.com',
                'password': 'admin123',
                'role': 'admin'
            },
            {
                'username': 'provider1',
                'email': 'provider1@vantage.com',
                'password': 'provider123',
                'role': 'provider'
            },
            {
                'username': 'client1',
                'email': 'client1@vantage.com',
                'password': 'client123',
                'role': 'client'
            }
        ]
        
        for user_data in users_data:
            if not User.query.filter_by(username=user_data['username']).first():
                hashed_password = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    password_hash=hashed_password,
                    role=user_data['role']
                )
                db.session.add(user)
                print(f"✅ Usuario creado: {user_data['username']}")
        
        # Crear categorías
        categories_data = [
            {'name': 'Tecnología', 'description': 'Productos y servicios tecnológicos'},
            {'name': 'Salud', 'description': 'Servicios de salud y bienestar'},
            {'name': 'Educación', 'description': 'Servicios educativos y capacitación'},
            {'name': 'Consultoría', 'description': 'Servicios de consultoría empresarial'}
        ]
        
        for cat_data in categories_data:
            if not Category.query.filter_by(name=cat_data['name']).first():
                category = Category(
                    name=cat_data['name'],
                    description=cat_data['description']
                )
                db.session.add(category)
                print(f"✅ Categoría creada: {cat_data['name']}")
        
        # Crear productos de prueba
        products_data = [
            {
                'name': 'Laptop Dell XPS 13',
                'description': 'Laptop ultrabook de alta gama',
                'price': 1299.99,
                'category': 'Tecnología',
                'provider_id': 2
            },
            {
                'name': 'Consultoría IT',
                'description': 'Servicios de consultoría en tecnología',
                'price': 150.00,
                'category': 'Consultoría',
                'provider_id': 2
            },
            {
                'name': 'Sesión de Yoga',
                'description': 'Clase personalizada de yoga',
                'price': 50.00,
                'category': 'Salud',
                'provider_id': 2
            }
        ]
        
        for prod_data in products_data:
            category = Category.query.filter_by(name=prod_data['category']).first()
            if category and not Product.query.filter_by(name=prod_data['name']).first():
                product = Product(
                    name=prod_data['name'],
                    description=prod_data['description'],
                    price=prod_data['price'],
                    category_id=category.id,
                    provider_id=prod_data['provider_id']
                )
                db.session.add(product)
                print(f"✅ Producto creado: {prod_data['name']}")
        
        db.session.commit()
        print("🎉 Datos de prueba creados exitosamente!")

if __name__ == '__main__':
    create_test_data()
EOF
fi

# 6. Copiar archivo al contenedor
docker cp populate_database_fixed.py vantage-backend-1:/app/

# 7. Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose -f docker-compose.ec2.yml exec backend python -c "
from vantage_backend import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    print('🔄 Ejecutando migraciones...')
    upgrade()
    print('✅ Migraciones completadas')
"

# 8. Poblar base de datos
echo "📊 Poblando base de datos..."
docker-compose -f docker-compose.ec2.yml exec backend python populate_database_fixed.py

# 9. Verificar datos creados
echo "📋 Verificando datos creados..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo "👥 Verificando usuarios..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT id, username, email, role FROM users;
"

echo "📦 Verificando productos..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT id, name, price FROM products;
"

# 10. Reiniciar backend
echo "🔄 Reiniciando backend..."
docker-compose -f docker-compose.ec2.yml restart backend

# 11. Verificar que responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo "🎉 Configuración completada!"
echo "📊 Tu API está lista en: http://localhost:5002"
echo "🗄️ Base de datos: vantageai"
echo "👥 Usuarios de prueba creados"
echo "📦 Productos de prueba creados" 