#!/bin/bash

# Script de despliegue para EC2 - Solo Backend y PostgreSQL
echo "🚀 Iniciando despliegue de Backend y PostgreSQL en EC2..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Por favor, reinicia la sesión SSH."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado."
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.ec2.yml down

# Limpiar imágenes antiguas (opcional)
echo "🧹 Limpiando imágenes antiguas..."
docker system prune -f

# Construir y levantar servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose -f docker-compose.ec2.yml up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.ec2.yml ps

# Verificar logs
echo "📋 Mostrando logs del backend..."
docker-compose -f docker-compose.ec2.yml logs backend

echo "📋 Mostrando logs de PostgreSQL..."
docker-compose -f docker-compose.ec2.yml logs postgres

# Verificar conectividad
echo "🔗 Verificando conectividad..."
if curl -f http://localhost:5002/health; then
    echo "✅ Backend está funcionando correctamente"
else
    echo "❌ Backend no responde. Revisando logs..."
    docker-compose -f docker-compose.ec2.yml logs backend
fi

echo "🎉 Despliegue completado!"
echo "📊 Servicios disponibles:"
echo "   - Backend API: http://localhost:5002"
echo "   - PostgreSQL: localhost:5432"
echo "   - Health Check: http://localhost:5002/health" 