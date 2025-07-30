#!/bin/bash

# Script completo para configurar la base de datos
echo "🚀 Configurando base de datos completa..."

# 1. Solucionar problema de collation
echo "🔧 Solucionando problema de collation..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d postgres -c "
UPDATE pg_database SET datcollversion = 0 WHERE datname = 'template1';
UPDATE pg_database SET datcollversion = 0 WHERE datname = 'postgres';
UPDATE pg_database SET datcollversion = 0 WHERE datname = 'vantageai_prod';
"

# 2. Crear base de datos si no existe
echo "📝 Creando base de datos vantageai..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d postgres -c "
CREATE DATABASE vantageai TEMPLATE template0;
" 2>/dev/null || echo "✅ Base de datos ya existe"

# 3. Ejecutar migraciones
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

# 4. Poblar con datos de prueba
echo "📊 Poblando base de datos con datos de prueba..."
docker-compose -f docker-compose.ec2.yml exec backend python populate_database_fixed.py

# 5. Verificar tablas y datos
echo "📋 Verificando tablas creadas..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

# 6. Verificar datos de usuarios
echo "👥 Verificando usuarios creados..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT id, username, email, role FROM users LIMIT 5;
"

# 7. Verificar productos
echo "📦 Verificando productos creados..."
docker-compose -f docker-compose.ec2.yml exec postgres psql -U vantage_user -d vantageai -c "
SELECT id, name, price, category FROM products LIMIT 5;
"

# 8. Reiniciar backend
echo "🔄 Reiniciando backend..."
docker-compose -f docker-compose.ec2.yml restart backend

# 9. Verificar que el backend responde
echo "🔍 Verificando que el backend responde..."
sleep 5
curl -f http://localhost:5002/health && echo "✅ Backend responde correctamente" || echo "❌ Backend no responde"

echo "🎉 Configuración de base de datos completada!"
echo "📊 Tu API está lista en: http://localhost:5002"
echo "🗄️ Base de datos: vantageai"
echo "👥 Usuarios de prueba creados"
echo "📦 Productos de prueba creados" 