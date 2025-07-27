#!/bin/bash

# Script de solución rápida para problemas de login en EC2
echo "🚀 Solución rápida para problemas de login en EC2..."
echo "=================================================="

# Obtener IP pública
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
if [ -z "$EC2_PUBLIC_IP" ]; then
    EC2_PUBLIC_IP=$(curl -s ifconfig.me)
fi

echo "🌐 IP Pública: $EC2_PUBLIC_IP"
echo ""

# Paso 1: Verificar que el backend esté ejecutándose
echo "1️⃣ Verificando backend..."
if curl -s http://localhost:5002/health > /dev/null 2>&1; then
    echo "✅ Backend está ejecutándose"
else
    echo "❌ Backend no responde, reiniciando..."
    docker-compose -f docker-compose.prod.yml restart backend-prod
    sleep 5
fi

# Paso 2: Verificar que el endpoint /health funcione
echo ""
echo "2️⃣ Verificando endpoint /health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5002/health)
if [ $? -eq 0 ]; then
    echo "✅ Health endpoint responde: $HEALTH_RESPONSE"
else
    echo "❌ Health endpoint no responde"
    echo "🔧 Reconstruyendo backend..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build --no-cache backend-prod
    docker-compose -f docker-compose.prod.yml up -d
    sleep 10
fi

# Paso 3: Verificar que el frontend esté ejecutándose
echo ""
echo "3️⃣ Verificando frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend está ejecutándose"
else
    echo "❌ Frontend no responde, reiniciando..."
    docker-compose -f docker-compose.prod.yml restart frontend-prod
    sleep 5
fi

# Paso 4: Copiar archivos de prueba si no existen
echo ""
echo "4️⃣ Verificando archivos de prueba..."
if ! docker-compose -f docker-compose.prod.yml exec backend-prod test -f "/app/create_test_user.py"; then
    echo "📁 Copiando archivos de prueba..."
    docker-compose -f docker-compose.prod.yml cp create_test_user.py backend-prod:/app/
    docker-compose -f docker-compose.prod.yml cp create_test_client.py backend-prod:/app/
    docker-compose -f docker-compose.prod.yml cp fix_passwords.py backend-prod:/app/
    docker-compose -f docker-compose.prod.yml cp simple_populate.py backend-prod:/app/
    echo "✅ Archivos copiados"
else
    echo "✅ Archivos de prueba ya existen"
fi

# Paso 5: Crear usuario de prueba
echo ""
echo "5️⃣ Creando usuario de prueba..."
docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_user.py
echo "✅ Usuario de prueba creado"

# Paso 6: Verificar conectividad desde IP pública
echo ""
echo "6️⃣ Verificando conectividad desde IP pública..."
if curl -s http://$EC2_PUBLIC_IP:5002/health > /dev/null 2>&1; then
    echo "✅ Backend accesible desde IP pública"
else
    echo "❌ Backend no accesible desde IP pública"
    echo "🔧 Verificar Security Group - puerto 5002 debe estar abierto"
fi

# Paso 7: Mostrar información final
echo ""
echo "🎉 Solución aplicada!"
echo "===================="
echo ""
echo "📱 URLs de acceso:"
echo "Frontend: http://$EC2_PUBLIC_IP:3000"
echo "Backend: http://$EC2_PUBLIC_IP:5002"
echo "Health Check: http://$EC2_PUBLIC_IP:5002/health"
echo ""
echo "🔑 Credenciales de prueba:"
echo "Email: test@example.com"
echo "Password: test123"
echo ""
echo "🔧 Si aún no puedes hacer login:"
echo "1. Verifica que el Security Group permita tráfico en puertos 3000 y 5002"
echo "2. Ejecuta: docker-compose -f docker-compose.prod.yml logs -f backend-prod"
echo "3. Verifica que no haya errores de CORS en la consola del navegador"
echo ""
echo "📋 Comandos útiles:"
echo "Ver logs del backend: docker-compose -f docker-compose.prod.yml logs -f backend-prod"
echo "Ver logs del frontend: docker-compose -f docker-compose.prod.yml logs -f frontend-prod"
echo "Reiniciar todo: docker-compose -f docker-compose.prod.yml restart" 