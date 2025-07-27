#!/bin/bash

# Script para solucionar problemas de CORS en EC2
echo "🔧 Solucionando problema de CORS en EC2..."

# Obtener IP pública
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
if [ -z "$EC2_PUBLIC_IP" ]; then
    EC2_PUBLIC_IP=$(curl -s ifconfig.me)
fi

echo "🌐 IP Pública: $EC2_PUBLIC_IP"

# Verificar que la IP esté en el archivo .env
if [ -f .env ]; then
    if grep -q "EC2_PUBLIC_IP" .env; then
        # Actualizar la variable existente
        sed -i "s/EC2_PUBLIC_IP=.*/EC2_PUBLIC_IP=$EC2_PUBLIC_IP/" .env
    else
        # Agregar la variable al final del archivo
        echo "EC2_PUBLIC_IP=$EC2_PUBLIC_IP" >> .env
    fi
    echo "✅ Archivo .env actualizado con EC2_PUBLIC_IP=$EC2_PUBLIC_IP"
else
    echo "⚠️ Archivo .env no encontrado"
fi

# Reconstruir el backend con la nueva configuración CORS
echo "🔨 Reconstruyendo backend con nueva configuración CORS..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache backend-prod
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que el backend se inicie
echo "⏳ Esperando a que el backend se inicie..."
sleep 15

# Verificar que el backend esté funcionando
echo "🔍 Verificando que el backend esté funcionando..."
if curl -s http://localhost:5002/health > /dev/null 2>&1; then
    echo "✅ Backend funcionando correctamente"
else
    echo "❌ Backend no responde, mostrando logs..."
    docker-compose -f docker-compose.prod.yml logs --tail=20 backend-prod
    exit 1
fi

# Verificar conectividad desde IP pública
echo "🌐 Verificando conectividad desde IP pública..."
if curl -s http://$EC2_PUBLIC_IP:5002/health > /dev/null 2>&1; then
    echo "✅ Backend accesible desde IP pública"
else
    echo "❌ Backend no accesible desde IP pública"
fi

# Crear usuario de prueba si no existe
echo "👤 Creando usuario de prueba..."
docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_user.py

echo ""
echo "🎉 Configuración CORS aplicada!"
echo "=============================="
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
echo "🔧 Para verificar que CORS funciona:"
echo "1. Abre http://$EC2_PUBLIC_IP:3000 en tu navegador"
echo "2. Abre la consola del navegador (F12)"
echo "3. Intenta hacer login"
echo "4. No deberías ver errores de CORS"
echo ""
echo "📋 Si aún hay problemas de CORS:"
echo "docker-compose -f docker-compose.prod.yml logs -f backend-prod" 