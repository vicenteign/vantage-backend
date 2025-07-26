#!/bin/bash

# Script para verificar y corregir la estructura del proyecto
echo "🔍 Verificando estructura del proyecto..."

# Función para mostrar mensajes de estado
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar directorio actual
log "📁 Directorio actual: $(pwd)"

# Verificar si estamos en el directorio correcto
if [ -f "docker-compose.prod.yml" ] && [ -d "vantageai-frontend" ]; then
    log "✅ Estructura correcta detectada"
    PROJECT_ROOT=$(pwd)
elif [ -f "../docker-compose.prod.yml" ] && [ -d "../vantageai-frontend" ]; then
    log "📁 Moviendo al directorio raíz del proyecto..."
    cd ..
    PROJECT_ROOT=$(pwd)
elif [ -f "../../docker-compose.prod.yml" ] && [ -d "../../vantageai-frontend" ]; then
    log "📁 Moviendo al directorio raíz del proyecto..."
    cd ../..
    PROJECT_ROOT=$(pwd)
else
    log "❌ No se encontró la estructura correcta del proyecto"
    log "🔍 Buscando archivos del proyecto..."
    
    # Buscar docker-compose.prod.yml
    COMPOSE_FILE=$(find /home/ubuntu -name "docker-compose.prod.yml" 2>/dev/null | head -1)
    if [ -n "$COMPOSE_FILE" ]; then
        PROJECT_ROOT=$(dirname "$COMPOSE_FILE")
        log "📁 Proyecto encontrado en: $PROJECT_ROOT"
        cd "$PROJECT_ROOT"
    else
        log "❌ No se encontró docker-compose.prod.yml"
        exit 1
    fi
fi

log "📁 Directorio del proyecto: $PROJECT_ROOT"

# Verificar estructura
log "🔍 Verificando estructura de archivos..."
if [ -f "docker-compose.prod.yml" ]; then
    log "✅ docker-compose.prod.yml encontrado"
else
    log "❌ docker-compose.prod.yml no encontrado"
    exit 1
fi

if [ -d "vantageai-frontend" ]; then
    log "✅ directorio vantageai-frontend encontrado"
else
    log "❌ directorio vantageai-frontend no encontrado"
    exit 1
fi

if [ -d "vantage_backend" ]; then
    log "✅ directorio vantage_backend encontrado"
else
    log "❌ directorio vantage_backend no encontrado"
    exit 1
fi

# Verificar archivos necesarios
log "🔍 Verificando archivos necesarios..."
if [ -f "vantageai-frontend/package.json" ]; then
    log "✅ package.json encontrado"
else
    log "❌ package.json no encontrado"
    exit 1
fi

if [ -f "Dockerfile.backend" ]; then
    log "✅ Dockerfile.backend encontrado"
else
    log "❌ Dockerfile.backend no encontrado"
    exit 1
fi

if [ -f "Dockerfile.frontend.prod" ]; then
    log "✅ Dockerfile.frontend.prod encontrado"
else
    log "❌ Dockerfile.frontend.prod no encontrado"
    exit 1
fi

log "✅ Estructura del proyecto verificada correctamente"
echo ""
echo "📁 Directorio actual: $(pwd)"
echo "📋 Archivos encontrados:"
ls -la
echo ""
echo "🚀 Ahora puedes ejecutar:"
echo "   ./create_env.sh"
echo "   nano .env"
echo "   ./deploy.sh" 