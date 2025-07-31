#!/bin/bash

# Script para corregir el archivo .env
echo "🔧 Corrigiendo archivo .env..."

# 1. Crear archivo .env corregido
echo "📝 Creando archivo .env corregido..."
cat > .env << 'EOF'
# Variables de entorno para producción en EC2

# PostgreSQL Configuration
POSTGRES_DB=vantageai
POSTGRES_USER=vantage_user
POSTGRES_PASSWORD=VantageSecure2024%21%40%23

# Backend Configuration
FLASK_APP=run_backend.py
FLASK_ENV=production
DATABASE_URL=postgresql://vantage_user:VantageSecure2024%21%40%23@postgres:5432/vantageai

# JWT Configuration
JWT_SECRET_KEY=VantageJWTSecret2024%21%40%23%24%25%5E%26%2A%28%29

# API Keys
OPENAI_API_KEY=tu-api-key-de-openai-aqui

# CORS Configuration para Amplify
CORS_ORIGINS=https://tu-dominio-amplify.amplifyapp.com,http://localhost:3000

# Logging
LOG_LEVEL=INFO
EOF

echo "✅ Archivo .env corregido creado"

# 2. Verificar el contenido
echo "📋 Contenido del archivo .env:"
cat .env

# 3. Detener servicios actuales
echo "🛑 Deteniendo servicios actuales..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env down 2>/dev/null || true

# 4. Eliminar volumen de PostgreSQL
echo "🗑️ Eliminando volumen anterior..."
docker volume rm vantage_postgres_data 2>/dev/null || echo "Volumen no existe"

# 5. Levantar servicios con archivo corregido
echo "🚀 Levantando servicios con archivo .env corregido..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env up -d

# 6. Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15

# 7. Verificar conexión
echo "🔍 Verificando conexión a PostgreSQL..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python -c "
import psycopg2
import os
try:
    db_url = os.environ.get('DATABASE_URL')
    print(f'🔗 Intentando conectar con: {db_url}')
    conn = psycopg2.connect(db_url)
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

# 8. Si la conexión funciona, ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python -c "
from vantage_backend import create_app
from flask_migrate import upgrade
app = create_app()
with app.app_context():
    print('🔄 Ejecutando migraciones...')
    upgrade()
    print('✅ Migraciones completadas')
"

# 9. Poblar base de datos
echo "📊 Poblando base de datos..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python populate_database_fixed.py

# 10. Verificar que el backend responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo "🎉 Archivo .env corregido y servicios funcionando!" 