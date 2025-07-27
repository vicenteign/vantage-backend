#!/bin/bash

# Script para diagnosticar y solucionar problemas de conexión del backend
echo "🔍 Diagnóstico de problemas de conexión del backend..."

# Verificar si Docker está ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está ejecutándose"
    exit 1
fi

# Verificar si los contenedores están ejecutándose
echo "📊 Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔍 Verificando puertos en uso:"
netstat -tulpn | grep :5002 || echo "Puerto 5002 no está en uso"

echo ""
echo "🔍 Verificando logs del backend:"
docker-compose -f docker-compose.prod.yml logs --tail=20 backend-prod

echo ""
echo "🔍 Verificando conectividad al backend:"
if curl -s http://localhost:5002/health > /dev/null 2>&1; then
    echo "✅ Backend responde en http://localhost:5002"
else
    echo "❌ Backend no responde en http://localhost:5002"
fi

echo ""
echo "🔍 Verificando archivos en el contenedor:"
docker-compose -f docker-compose.prod.yml exec backend-prod ls -la /app/ | head -10

echo ""
echo "📝 Comandos útiles para solucionar problemas:"
echo ""
echo "1. Reiniciar el backend:"
echo "   docker-compose -f docker-compose.prod.yml restart backend-prod"
echo ""
echo "2. Ver logs en tiempo real:"
echo "   docker-compose -f docker-compose.prod.yml logs -f backend-prod"
echo ""
echo "3. Entrar al contenedor:"
echo "   docker-compose -f docker-compose.prod.yml exec backend-prod bash"
echo ""
echo "4. Copiar archivos de prueba:"
echo "   ./copy_test_files.sh"
echo ""
echo "5. Reconstruir el contenedor:"
echo "   docker-compose -f docker-compose.prod.yml build backend-prod"
echo "   docker-compose -f docker-compose.prod.yml up -d backend-prod" 