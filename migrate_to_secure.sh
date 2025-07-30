#!/bin/bash

# Script para migrar a configuración segura
echo "🔐 Migrando a configuración segura..."

# 1. Detener servicios actuales
echo "🛑 Deteniendo servicios actuales..."
docker-compose -f docker-compose.ec2.yml down

# 2. Hacer backup de los datos actuales
echo "💾 Haciendo backup de datos..."
docker volume ls | grep postgres_data && {
    echo "📦 Backup del volumen PostgreSQL..."
    docker run --rm -v vantage_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
}

# 3. Eliminar volumen actual
echo "🗑️ Eliminando volumen actual..."
docker volume rm vantage_postgres_data 2>/dev/null || echo "Volumen no existe"

# 4. Levantar con nueva configuración
echo "🚀 Levantando con nueva configuración segura..."
docker-compose -f docker-compose.ec2.secure.yml up -d

# 5. Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15

# 6. Verificar conexión con nueva contraseña
echo "🔍 Verificando conexión con nueva contraseña..."
docker-compose -f docker-compose.ec2.secure.yml exec backend python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://vantage_user:VantageSecure2024!@#@postgres:5432/vantageai')
    print('✅ Conexión exitosa con nueva contraseña')
    cursor = conn.cursor()
    cursor.execute('SELECT current_database();')
    db = cursor.fetchone()
    print(f'🗄️ Base de datos: {db[0]}')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'❌ Error de conexión: {e}')
"

# 7. Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose -f docker-compose.ec2.secure.yml exec backend python -c "
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
docker-compose -f docker-compose.ec2.secure.yml exec backend python populate_database_fixed.py

# 9. Verificar datos
echo "📋 Verificando datos..."
docker-compose -f docker-compose.ec2.secure.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

# 10. Verificar que el backend responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo "🎉 Migración a configuración segura completada!"
echo "🔐 Nueva contraseña: VantageSecure2024!@#"
echo "📊 Tu API está lista en: http://localhost:5002"
echo "🗄️ Base de datos: vantageai" 