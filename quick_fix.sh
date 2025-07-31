#!/bin/bash

echo "🚀 Corrección rápida del archivo .env..."

# 1. Detener servicios
echo "🛑 Deteniendo servicios..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env down 2>/dev/null || true

# 2. Crear archivo .env simple y correcto
echo "📝 Creando archivo .env corregido..."
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

# 3. Verificar el contenido
echo "📋 Contenido del archivo .env:"
cat .env

# 4. Eliminar volumen
echo "🗑️ Eliminando volumen anterior..."
docker volume rm vantage_postgres_data 2>/dev/null || echo "Volumen no existe"

# 5. Levantar servicios
echo "🚀 Levantando servicios..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env up -d

# 6. Esperar
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15

# 7. Verificar conexión
echo "🔍 Verificando conexión..."
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

# 10. Verificar que responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo "🎉 Corrección completada!" 