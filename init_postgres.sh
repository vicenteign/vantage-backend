#!/bin/bash

# Script para inicializar PostgreSQL y crear la base de datos
echo "🚀 Inicializando PostgreSQL..."

# Verificar que PostgreSQL esté corriendo
if ! docker-compose -f docker-compose.ec2.yml ps | grep -q postgres; then
    echo "❌ PostgreSQL no está corriendo. Iniciando..."
    docker-compose -f docker-compose.ec2.yml up -d postgres
    sleep 10
fi

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker-compose -f docker-compose.ec2.yml exec postgres pg_isready -U vantage_user; do
    echo "⏳ PostgreSQL aún no está listo..."
    sleep 2
done

echo "✅ PostgreSQL está listo"

# Verificar si la base de datos existe
if docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "SELECT 1;" 2>/dev/null; then
    echo "✅ La base de datos vantageai ya existe"
else
    echo "📝 Creando base de datos vantageai..."
    docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d postgres -c "CREATE DATABASE vantageai;"
    echo "✅ Base de datos vantageai creada"
fi

# Verificar conexión desde el backend
echo "🔍 Verificando conexión desde el backend..."
docker-compose -f docker-compose.ec2.yml exec backend python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://vantage_user:vantage_password_secure@postgres:5432/vantageai')
    print('✅ Conexión exitosa desde el backend')
    cursor = conn.cursor()
    cursor.execute('SELECT current_database();')
    db = cursor.fetchone()
    print(f'🗄️ Base de datos: {db[0]}')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'❌ Error de conexión: {e}')
"

# Ejecutar migraciones si la conexión es exitosa
echo "🔄 Ejecutando migraciones..."
docker-compose -f docker-compose.ec2.yml exec backend python -c "
try:
    from vantage_backend import create_app
    from flask_migrate import upgrade
    
    app = create_app()
    with app.app_context():
        upgrade()
        print('✅ Migraciones completadas')
except Exception as e:
    print(f'❌ Error en migraciones: {e}')
"

# Verificar tablas creadas
echo "📊 Verificando tablas creadas..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "\dt"

echo "🎉 Inicialización de PostgreSQL completada" 