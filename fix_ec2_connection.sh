#!/bin/bash

# Script completo para solucionar problemas de conexión en EC2
echo "🚀 Solucionando problemas de conexión en EC2..."

# Función para mostrar el estado actual
show_status() {
    echo "📊 Estado actual de los contenedores:"
    echo "====================================="
    docker-compose -f docker-compose.prod.yml ps
    echo ""
}

# Función para obtener la IP pública
get_public_ip() {
    echo "🌐 Obteniendo IP pública de EC2..."
    EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    
    if [ -z "$EC2_PUBLIC_IP" ]; then
        EC2_PUBLIC_IP=$(curl -s ifconfig.me)
    fi
    
    if [ -z "$EC2_PUBLIC_IP" ]; then
        echo "❌ No se pudo obtener la IP pública"
        return 1
    fi
    
    echo "✅ IP pública: $EC2_PUBLIC_IP"
    export EC2_PUBLIC_IP
    return 0
}

# Función para actualizar configuración
update_config() {
    echo "⚙️ Actualizando configuración..."
    
    # Actualizar .env con la IP pública
    if [ -f .env ]; then
        if grep -q "EC2_PUBLIC_IP" .env; then
            sed -i "s/EC2_PUBLIC_IP=.*/EC2_PUBLIC_IP=$EC2_PUBLIC_IP/" .env
        else
            echo "EC2_PUBLIC_IP=$EC2_PUBLIC_IP" >> .env
        fi
        echo "✅ Archivo .env actualizado"
    fi
    
    # Actualizar CORS en el backend
    echo "🔧 Actualizando configuración CORS..."
}

# Función para reiniciar servicios
restart_services() {
    echo "🔄 Reiniciando servicios..."
    docker-compose -f docker-compose.prod.yml down
    sleep 3
    docker-compose -f docker-compose.prod.yml up -d
    sleep 10
    echo "✅ Servicios reiniciados"
}

# Función para verificar conectividad
check_connectivity() {
    echo "🔍 Verificando conectividad..."
    
    # Verificar backend local
    if curl -s http://localhost:5002/health > /dev/null 2>&1; then
        echo "✅ Backend local: Funcionando"
    else
        echo "❌ Backend local: No responde"
        return 1
    fi
    
    # Verificar backend desde IP pública
    if curl -s http://$EC2_PUBLIC_IP:5002/health > /dev/null 2>&1; then
        echo "✅ Backend público: Funcionando"
    else
        echo "❌ Backend público: No responde"
        return 1
    fi
    
    return 0
}

# Función para mostrar información de conexión
show_connection_info() {
    echo ""
    echo "🌐 Información de conexión:"
    echo "============================"
    echo "IP Pública: $EC2_PUBLIC_IP"
    echo "Backend URL: http://$EC2_PUBLIC_IP:5002"
    echo "Frontend URL: http://$EC2_PUBLIC_IP:3000"
    echo "Health Check: http://$EC2_PUBLIC_IP:5002/health"
    echo ""
}

# Función para mostrar logs de error
show_error_logs() {
    echo "📋 Últimos logs del backend:"
    echo "============================"
    docker-compose -f docker-compose.prod.yml logs --tail=20 backend-prod
    echo ""
}

# Ejecutar el flujo principal
main() {
    # Mostrar estado inicial
    show_status
    
    # Obtener IP pública
    if ! get_public_ip; then
        echo "❌ No se pudo obtener la IP pública. Saliendo..."
        exit 1
    fi
    
    # Actualizar configuración
    update_config
    
    # Reiniciar servicios
    restart_services
    
    # Verificar conectividad
    if check_connectivity; then
        echo "🎉 ¡Problema resuelto!"
        show_connection_info
        echo "📝 Ahora puedes:"
        echo "1. Acceder al frontend: http://$EC2_PUBLIC_IP:3000"
        echo "2. Verificar el backend: http://$EC2_PUBLIC_IP:5002/health"
        echo "3. Probar el login desde el frontend"
    else
        echo "❌ Aún hay problemas de conectividad"
        show_error_logs
        echo ""
        echo "🔧 Pasos adicionales:"
        echo "1. Verificar que los puertos 3000 y 5002 estén abiertos en el Security Group"
        echo "2. Verificar que no haya firewall bloqueando los puertos"
        echo "3. Revisar los logs del backend para más detalles"
    fi
}

# Ejecutar el script principal
main 