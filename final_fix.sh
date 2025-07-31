#!/bin/bash

echo "🚀 Corrección final del archivo .env..."

# 1. Detener todos los servicios
echo "🛑 Deteniendo todos los servicios..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env down 2>/dev/null || true
docker-compose -f docker-compose.ec2.yml down 2>/dev/null || true
docker-compose -f docker-compose.ec2.secure.yml down 2>/dev/null || true

# 2. Eliminar archivo .env actual
echo "🗑️ Eliminando archivo .env actual..."
rm -f .env

# 3. Crear archivo .env completamente nuevo
echo "📝 Creando archivo .env completamente nuevo..."
cat > .env << 'EOF'
POSTGRES_DB=vantageai
POSTGRES_USER=vantage_user
POSTGRES_PASSWORD=VantageSecure2024
FLASK_APP=run_backend.py
FLASK_ENV=production
DATABASE_URL=postgresql://vantage_user:VantageSecure2024@postgres:5432/vantageai
JWT_SECRET_KEY=VantageJWTSecret2024
OPENAI_API_KEY=tu-api-key-de-openai-aqui
CORS_ORIGINS=https://tu-dominio-amplify.amplifyapp.com,http://localhost:3000
LOG_LEVEL=INFO
EOF

echo "✅ Archivo .env creado"

# 4. Verificar el contenido
echo "📋 Contenido del archivo .env:"
cat .env

# 5. Eliminar volumen de PostgreSQL
echo "🗑️ Eliminando volumen anterior..."
docker volume rm vantage_postgres_data 2>/dev/null || echo "Volumen no existe"

# 6. Levantar servicios
echo "🚀 Levantando servicios..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env up -d

# 7. Esperar
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 20

# 8. Verificar variables de entorno
echo "🔍 Verificando variables de entorno..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend env | grep DATABASE_URL

# 9. Probar conexión
echo "🔍 Probando conexión a PostgreSQL..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python -c "
import psycopg2
import os
try:
    db_url = os.environ.get('DATABASE_URL')
    print(f'🔗 URL: {db_url}')
    conn = psycopg2.connect(db_url)
    print('✅ Conexión exitosa')
    cursor = conn.cursor()
    cursor.execute('SELECT current_database();')
    db = cursor.fetchone()
    print(f'🗄️ Base de datos: {db[0]}')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'❌ Error: {e}')
    print('🔧 Intentando conectar directamente...')
    try:
        conn = psycopg2.connect('postgresql://vantage_user:VantageSecure2024@postgres:5432/vantageai')
        print('✅ Conexión directa exitosa')
        conn.close()
    except Exception as e2:
        print(f'❌ Error en conexión directa: {e2}')
"

# 10. Si la conexión funciona, ejecutar migraciones
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

# 11. Poblar base de datos
echo "📊 Poblando base de datos..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python populate_database_fixed.py

# 12. Verificar que responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo "🎉 Corrección final completada!"
echo "📊 Tu API está lista en: http://localhost:5002" 