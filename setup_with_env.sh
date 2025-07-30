#!/bin/bash

# Script para configurar el proyecto usando variables de entorno
echo "🔧 Configurando proyecto con variables de entorno..."

# 1. Crear archivo .env desde la plantilla
echo "📝 Creando archivo .env..."
if [ ! -f ".env" ]; then
    cp env-production-secure.txt .env
    echo "✅ Archivo .env creado desde plantilla"
else
    echo "⚠️ Archivo .env ya existe"
fi

# 2. Verificar que el archivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Error: No se pudo crear el archivo .env"
    exit 1
fi

# 3. Mostrar variables de entorno (sin contraseñas)
echo "📋 Variables de entorno configuradas:"
grep -v "PASSWORD\|SECRET\|API_KEY" .env | while read line; do
    if [[ $line =~ ^[A-Z_]+= ]]; then
        echo "   $line"
    fi
done

# 4. Detener servicios actuales si están corriendo
echo "🛑 Deteniendo servicios actuales..."
docker-compose -f docker-compose.ec2.yml down 2>/dev/null || true
docker-compose -f docker-compose.ec2.secure.yml down 2>/dev/null || true

# 5. Eliminar volumen de PostgreSQL si existe
echo "🗑️ Limpiando volumen anterior..."
docker volume rm vantage_postgres_data 2>/dev/null || echo "Volumen no existe"

# 6. Levantar servicios con nueva configuración
echo "🚀 Levantando servicios con variables de entorno..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env up -d

# 7. Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15

# 8. Verificar conexión
echo "🔍 Verificando conexión a PostgreSQL..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python -c "
import psycopg2
import os
try:
    db_url = os.environ.get('DATABASE_URL')
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

# 9. Ejecutar migraciones
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

# 10. Poblar base de datos
echo "📊 Poblando base de datos..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec backend python populate_database_fixed.py

# 11. Verificar datos
echo "📋 Verificando datos creados..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

# 12. Verificar que el backend responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo ""
echo "🎉 Configuración con variables de entorno completada!"
echo "📊 Tu API está lista en: http://localhost:5002"
echo "🗄️ Base de datos: $POSTGRES_DB"
echo "👤 Usuario: $POSTGRES_USER"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: docker-compose -f docker-compose.ec2.env.yml --env-file .env logs"
echo "   - Reiniciar: docker-compose -f docker-compose.ec2.env.yml --env-file .env restart"
echo "   - Detener: docker-compose -f docker-compose.ec2.env.yml --env-file .env down" 