#!/bin/bash

# Script para configurar y ejecutar VANTAGE con Docker
set -e

echo "🚀 Configurando VANTAGE con Docker..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker Desktop."
    exit 1
fi

# Verificar que Docker Compose esté disponible
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está disponible. Por favor instala Docker Compose."
    exit 1
fi

# Verificar que Docker esté ejecutándose
if ! docker info &> /dev/null; then
    print_error "Docker no está ejecutándose. Por favor inicia Docker Desktop."
    exit 1
fi

print_success "Docker está disponible y ejecutándose"

# Crear directorios necesarios
print_status "Creando directorios necesarios..."
mkdir -p instance
mkdir -p static/uploads/quotes

# Verificar si existe la base de datos
if [ ! -f "instance/vantageai.db" ]; then
    print_warning "No se encontró la base de datos. Se creará una nueva."
fi

# Función para mostrar menú
show_menu() {
    echo ""
    echo "🎯 ¿Qué quieres hacer?"
    echo "1) Ejecutar en modo PRODUCCIÓN"
    echo "2) Ejecutar en modo DESARROLLO"
    echo "3) Ejecutar con Nginx (PRODUCCIÓN)"
    echo "4) Solo construir las imágenes"
    echo "5) Limpiar contenedores e imágenes"
    echo "6) Ver logs"
    echo "7) Salir"
    echo ""
    read -p "Selecciona una opción (1-7): " choice
}

# Función para ejecutar en producción
run_production() {
    print_status "Ejecutando en modo PRODUCCIÓN..."
    docker compose up --build -d
    print_success "Aplicación iniciada en modo producción"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5002"
}

# Función para ejecutar en desarrollo
run_development() {
    print_status "Ejecutando en modo DESARROLLO..."
    docker compose -f docker-compose.dev.yml up --build -d
    print_success "Aplicación iniciada en modo desarrollo"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5002"
}

# Función para ejecutar con Nginx
run_with_nginx() {
    print_status "Ejecutando con Nginx..."
    docker compose --profile nginx up --build -d
    print_success "Aplicación iniciada con Nginx"
    print_status "Acceso principal: http://localhost"
    print_status "Frontend directo: http://localhost:3000"
    print_status "Backend directo: http://localhost:5002"
}

# Función para construir imágenes
build_images() {
    print_status "Construyendo imágenes Docker..."
    docker compose build
    print_success "Imágenes construidas exitosamente"
}

# Función para limpiar
cleanup() {
    print_status "Limpiando contenedores e imágenes..."
    docker compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    print_success "Limpieza completada"
}

# Función para ver logs
show_logs() {
    echo ""
    echo "📋 ¿Qué logs quieres ver?"
    echo "1) Todos los logs"
    echo "2) Solo backend"
    echo "3) Solo frontend"
    echo "4) Volver al menú principal"
    echo ""
    read -p "Selecciona una opción (1-4): " log_choice
    
    case $log_choice in
        1)
            docker compose logs -f
            ;;
        2)
            docker compose logs -f backend
            ;;
        3)
            docker compose logs -f frontend
            ;;
        4)
            return
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac
}

# Bucle principal
while true; do
    show_menu
    
    case $choice in
        1)
            run_production
            ;;
        2)
            run_development
            ;;
        3)
            run_with_nginx
            ;;
        4)
            build_images
            ;;
        5)
            cleanup
            ;;
        6)
            show_logs
            ;;
        7)
            print_status "¡Hasta luego!"
            exit 0
            ;;
        *)
            print_error "Opción inválida. Por favor selecciona 1-7."
            ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
done 