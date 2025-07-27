#!/bin/bash

# Script para copiar archivos de prueba al contenedor backend
echo "📁 Copiando archivos de prueba al contenedor backend..."

# Verificar si el contenedor está ejecutándose
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "backend-prod.*Up"; then
    echo "❌ El contenedor backend-prod no está ejecutándose"
    exit 1
fi

# Lista de archivos a copiar
FILES=(
    "create_test_user.py"
    "create_test_client.py"
    "fix_passwords.py"
    "simple_populate.py"
)

# Copiar cada archivo
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📋 Copiando $file..."
        docker-compose -f docker-compose.prod.yml cp "$file" backend-prod:/app/
        if [ $? -eq 0 ]; then
            echo "✅ $file copiado exitosamente"
        else
            echo "❌ Error al copiar $file"
        fi
    else
        echo "⚠️  Archivo $file no encontrado"
    fi
done

echo ""
echo "🎉 Proceso completado!"
echo ""
echo "📝 Ahora puedes ejecutar:"
echo "   docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_user.py"
echo "   docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_client.py" 