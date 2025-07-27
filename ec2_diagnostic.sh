#!/bin/bash

# Script de diagnóstico completo para EC2
echo "🔍 Diagnóstico completo de problemas en EC2..."
echo "=============================================="

# Función para mostrar información del sistema
show_system_info() {
    echo "📊 Información del sistema:"
    echo "==========================="
    echo "IP Pública: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "IP Privada: $(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)"
    echo "Región: $(curl -s http://169.254.169.254/latest/meta-data/placement/region)"
    echo ""
}

# Función para verificar estado de Docker
check_docker_status() {
    echo "🐳 Estado de Docker:"
    echo "==================="
    docker --version
    docker-compose --version
    echo ""
    
    echo "📦 Contenedores ejecutándose:"
    docker ps
    echo ""
}

# Función para verificar logs del backend
check_backend_logs() {
    echo "📋 Logs del backend:"
    echo "==================="
    docker-compose -f docker-compose.prod.yml logs --tail=30 backend-prod
    echo ""
}

# Función para verificar conectividad
check_connectivity() {
    echo "🔌 Verificando conectividad:"
    echo "============================"
    
    # Verificar puertos locales
    echo "Puerto 5002 (backend):"
    if netstat -tulpn | grep :5002; then
        echo "✅ Puerto 5002 está en uso"
    else
        echo "❌ Puerto 5002 no está en uso"
    fi
    
    echo ""
    echo "Puerto 3000 (frontend):"
    if netstat -tulpn | grep :3000; then
        echo "✅ Puerto 3000 está en uso"
    else
        echo "❌ Puerto 3000 no está en uso"
    fi
    
    echo ""
    
    # Verificar health check
    echo "Health check del backend:"
    if curl -s http://localhost:5002/health; then
        echo "✅ Backend responde correctamente"
    else
        echo "❌ Backend no responde"
    fi
    
    echo ""
}

# Función para verificar archivos en el contenedor
check_container_files() {
    echo "📁 Archivos en el contenedor backend:"
    echo "====================================="
    docker-compose -f docker-compose.prod.yml exec backend-prod ls -la /app/ | head -20
    echo ""
    
    echo "🔍 Verificando archivos específicos:"
    FILES=("create_test_user.py" "create_test_client.py" "fix_passwords.py" "simple_populate.py")
    for file in "${FILES[@]}"; do
        if docker-compose -f docker-compose.prod.yml exec backend-prod test -f "/app/$file"; then
            echo "✅ $file existe"
        else
            echo "❌ $file no existe"
        fi
    done
    echo ""
}

# Función para verificar configuración de red
check_network_config() {
    echo "🌐 Configuración de red:"
    echo "======================="
    
    # Verificar Security Groups (información básica)
    echo "Puertos abiertos en el sistema:"
    sudo netstat -tulpn | grep LISTEN
    echo ""
    
    # Verificar conectividad externa
    echo "Conectividad externa:"
    if curl -s --connect-timeout 5 http://google.com > /dev/null; then
        echo "✅ Conectividad externa OK"
    else
        echo "❌ Sin conectividad externa"
    fi
    echo ""
}

# Función para verificar variables de entorno
check_environment() {
    echo "⚙️ Variables de entorno:"
    echo "========================"
    
    if [ -f .env ]; then
        echo "Archivo .env encontrado:"
        cat .env | grep -E "(DATABASE|JWT|OPENAI|EC2)" || echo "No se encontraron variables relevantes"
    else
        echo "❌ Archivo .env no encontrado"
    fi
    
    echo ""
    echo "Variables en el contenedor:"
    docker-compose -f docker-compose.prod.yml exec backend-prod env | grep -E "(DATABASE|JWT|OPENAI|EC2)" || echo "No se encontraron variables relevantes"
    echo ""
}

# Función para mostrar comandos de solución
show_solution_commands() {
    echo "🔧 Comandos de solución:"
    echo "======================="
    echo ""
    echo "1. Si el backend no responde:"
    echo "   docker-compose -f docker-compose.prod.yml restart backend-prod"
    echo ""
    echo "2. Si faltan archivos de prueba:"
    echo "   docker-compose -f docker-compose.prod.yml cp create_test_user.py backend-prod:/app/"
    echo "   docker-compose -f docker-compose.prod.yml cp create_test_client.py backend-prod:/app/"
    echo ""
    echo "3. Para reconstruir completamente:"
    echo "   docker-compose -f docker-compose.prod.yml down"
    echo "   docker-compose -f docker-compose.prod.yml build --no-cache backend-prod"
    echo "   docker-compose -f docker-compose.prod.yml up -d"
    echo ""
    echo "4. Para ver logs en tiempo real:"
    echo "   docker-compose -f docker-compose.prod.yml logs -f backend-prod"
    echo ""
    echo "5. Para ejecutar scripts de prueba:"
    echo "   docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_user.py"
    echo "   docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_client.py"
    echo ""
}

# Función para verificar el frontend
check_frontend() {
    echo "🎨 Estado del frontend:"
    echo "======================"
    
    # Verificar logs del frontend
    echo "Logs del frontend:"
    docker-compose -f docker-compose.prod.yml logs --tail=10 frontend-prod
    echo ""
    
    # Verificar si el frontend responde
    echo "Respuesta del frontend:"
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend responde"
    else
        echo "❌ Frontend no responde"
    fi
    echo ""
}

# Ejecutar todas las verificaciones
main() {
    show_system_info
    check_docker_status
    check_backend_logs
    check_connectivity
    check_container_files
    check_network_config
    check_environment
    check_frontend
    show_solution_commands
    
    echo "🎯 Resumen del diagnóstico:"
    echo "=========================="
    echo "Si ves ❌ en alguna verificación, usa los comandos de solución arriba."
    echo "Si todo está ✅, el problema puede ser de configuración de red o CORS."
}

# Ejecutar el diagnóstico
main 