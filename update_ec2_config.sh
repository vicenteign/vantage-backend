#!/bin/bash

# Script para actualizar la configuración de EC2 con la IP pública
echo "🌐 Actualizando configuración para EC2..."

# Obtener la IP pública de EC2
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

if [ -z "$EC2_PUBLIC_IP" ]; then
    echo "❌ No se pudo obtener la IP pública de EC2"
    echo "🔍 Intentando obtener IP desde curl..."
    EC2_PUBLIC_IP=$(curl -s ifconfig.me)
fi

if [ -z "$EC2_PUBLIC_IP" ]; then
    echo "❌ No se pudo obtener la IP pública"
    exit 1
fi

echo "✅ IP pública de EC2: $EC2_PUBLIC_IP"

# Actualizar el archivo .env con la IP pública
if [ -f .env ]; then
    # Verificar si ya existe la variable EC2_PUBLIC_IP
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

# Mostrar información de conectividad
echo ""
echo "🌐 Información de conectividad:"
echo "================================"
echo "IP Pública: $EC2_PUBLIC_IP"
echo "Backend URL: http://$EC2_PUBLIC_IP:5002"
echo "Frontend URL: http://$EC2_PUBLIC_IP:3000"
echo ""

# Verificar que los puertos estén abiertos
echo "🔍 Verificando puertos..."
if curl -s http://localhost:5002/health > /dev/null 2>&1; then
    echo "✅ Backend (puerto 5002): Funcionando"
else
    echo "❌ Backend (puerto 5002): No responde"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend (puerto 3000): Funcionando"
else
    echo "❌ Frontend (puerto 3000): No responde"
fi

echo ""
echo "📝 Próximos pasos:"
echo "1. Reiniciar los contenedores para aplicar la nueva configuración:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "2. Verificar que el backend responda:"
echo "   curl http://$EC2_PUBLIC_IP:5002/health"
echo ""
echo "3. Acceder al frontend desde:"
echo "   http://$EC2_PUBLIC_IP:3000" 