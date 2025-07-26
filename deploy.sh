#!/bin/bash

# Script de despliegue para Vantage en EC2
echo "🚀 Iniciando despliegue de Vantage en EC2..."

# Variables de configuración
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="vantage"

# Función para mostrar mensajes de estado
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar que Docker y Docker Compose estén instalados
check_dependencies() {
    log "🔍 Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        log "❌ Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log "❌ Docker Compose no está instalado"
        exit 1
    fi
    
    log "✅ Dependencias verificadas"
}

# Crear directorios necesarios
setup_directories() {
    log "📁 Creando directorios..."
    
    mkdir -p static uploads
    chmod 755 static uploads
    
    log "✅ Directorios creados"
}

# Configurar variables de entorno
setup_environment() {
    log "⚙️ Configurando variables de entorno..."
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        cat > .env << EOF
# Variables de entorno para producción
JWT_SECRET_KEY=$(openssl rand -hex 32)
OPENAI_API_KEY=your_openai_api_key_here
EOF
        log "📝 Archivo .env creado"
    else
        log "📝 Archivo .env ya existe"
    fi
    
    log "✅ Variables de entorno configuradas"
}

# Detener y limpiar contenedores existentes
cleanup_containers() {
    log "🧹 Limpiando contenedores existentes..."
    
    docker-compose -f $COMPOSE_FILE down --remove-orphans
    docker system prune -f
    
    log "✅ Limpieza completada"
}

# Construir y levantar servicios
build_and_start() {
    log "🔨 Construyendo y levantando servicios..."
    
    # Construir imágenes
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    # Levantar servicios
    docker-compose -f $COMPOSE_FILE up -d
    
    log "✅ Servicios construidos y levantados"
}

# Verificar que los servicios estén funcionando
check_services() {
    log "🔍 Verificando servicios..."
    
    # Esperar un poco para que los servicios se inicien
    sleep 30
    
    # Verificar que los contenedores estén corriendo
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log "✅ Servicios funcionando correctamente"
    else
        log "❌ Error: Los servicios no están funcionando"
        docker-compose -f $COMPOSE_FILE logs
        exit 1
    fi
}

# Mostrar información de acceso
show_access_info() {
    log "🌐 Información de acceso:"
    echo ""
    echo "=========================================="
    echo "🚀 VANTAGE - Despliegue Completado"
    echo "=========================================="
    echo ""
    echo "📱 Frontend: http://$(curl -s ifconfig.me):3000"
    echo "🔧 Backend API: http://$(curl -s ifconfig.me):5002"
    echo ""
    echo "📊 Estado de servicios:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "📝 Logs en tiempo real:"
    echo "  docker-compose -f $COMPOSE_FILE logs -f"
    echo ""
    echo "🛑 Detener servicios:"
    echo "  docker-compose -f $COMPOSE_FILE down"
    echo ""
    echo "🔄 Reiniciar servicios:"
    echo "  docker-compose -f $COMPOSE_FILE restart"
    echo ""
    echo "=========================================="
}

# Función principal
main() {
    log "🎯 Iniciando despliegue de Vantage..."
    
    check_dependencies
    setup_directories
    setup_environment
    cleanup_containers
    build_and_start
    check_services
    show_access_info
    
    log "🎉 ¡Despliegue completado exitosamente!"
}

# Ejecutar función principal
main "$@" 