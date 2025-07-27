#!/bin/bash

# Script para solucionar problemas del backend en EC2
echo "🚀 Solucionando problemas del backend en EC2..."

# Función para mostrar el estado actual
show_status() {
    echo "📊 Estado actual:"
    echo "=================="
    docker-compose -f docker-compose.prod.yml ps
    echo ""
}

# Función para verificar conectividad
check_connectivity() {
    echo "🔍 Verificando conectividad..."
    if curl -s http://localhost:5002/health > /dev/null 2>&1; then
        echo "✅ Backend responde correctamente"
        return 0
    else
        echo "❌ Backend no responde"
        return 1
    fi
}

# Función para copiar archivos de prueba
copy_test_files() {
    echo "📁 Copiando archivos de prueba..."
    
    FILES=(
        "create_test_user.py"
        "create_test_client.py"
        "fix_passwords.py"
        "simple_populate.py"
    )
    
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "📋 Copiando $file..."
            docker-compose -f docker-compose.prod.yml cp "$file" backend-prod:/app/
            if [ $? -eq 0 ]; then
                echo "✅ $file copiado"
            else
                echo "❌ Error al copiar $file"
            fi
        else
            echo "⚠️  $file no encontrado"
        fi
    done
}

# Función para reiniciar servicios
restart_services() {
    echo "🔄 Reiniciando servicios..."
    docker-compose -f docker-compose.prod.yml restart backend-prod
    sleep 5
    echo "✅ Servicios reiniciados"
}

# Función para reconstruir contenedor
rebuild_container() {
    echo "🔨 Reconstruyendo contenedor backend..."
    docker-compose -f docker-compose.prod.yml build backend-prod
    docker-compose -f docker-compose.prod.yml up -d backend-prod
    sleep 10
    echo "✅ Contenedor reconstruido"
}

# Mostrar estado inicial
show_status

# Verificar conectividad inicial
if check_connectivity; then
    echo "✅ El backend está funcionando correctamente"
    copy_test_files
    echo ""
    echo "🎉 Problema resuelto! Ahora puedes ejecutar:"
    echo "   docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_user.py"
    exit 0
fi

# Si no responde, intentar reiniciar
echo "🔄 Intentando reiniciar el backend..."
restart_services

if check_connectivity; then
    echo "✅ El backend ahora responde después del reinicio"
    copy_test_files
    exit 0
fi

# Si aún no responde, reconstruir el contenedor
echo "🔨 Reconstruyendo el contenedor..."
rebuild_container

if check_connectivity; then
    echo "✅ El backend responde después de la reconstrucción"
    copy_test_files
    exit 0
fi

# Si nada funciona, mostrar logs
echo "❌ El backend aún no responde. Mostrando logs..."
docker-compose -f docker-compose.prod.yml logs --tail=50 backend-prod

echo ""
echo "🔧 Pasos manuales adicionales:"
echo "1. Verificar que la base de datos esté funcionando:"
echo "   docker-compose -f docker-compose.prod.yml ps postgres-prod"
echo ""
echo "2. Verificar variables de entorno:"
echo "   docker-compose -f docker-compose.prod.yml exec backend-prod env | grep -E '(DATABASE|JWT|OPENAI)'"
echo ""
echo "3. Verificar conectividad a la base de datos:"
echo "   docker-compose -f docker-compose.prod.yml exec backend-prod python -c \"from vantage_backend import create_app; app = create_app(); print('App created successfully')\"" 