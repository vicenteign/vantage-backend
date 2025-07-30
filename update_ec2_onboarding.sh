#!/bin/bash

# Script para actualizar el servidor EC2 con los cambios del onboarding
echo "🚀 Actualizando servidor EC2 con onboarding..."

# Configuración
EC2_IP="3.141.40.201"
EC2_USER="ubuntu"
EC2_KEY="~/.ssh/vantage-key.pem"

echo "📡 Conectando a EC2..."
ssh -i $EC2_KEY $EC2_USER@$EC2_IP << 'EOF'

echo "🔄 Actualizando código desde GitHub..."
cd /home/ubuntu/vantage-backend
git pull origin main

echo "🐳 Reconstruyendo contenedores Docker..."
docker compose down
docker compose up --build -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 30

echo "🔍 Verificando estado de los servicios..."
docker compose ps

echo "🧪 Probando endpoints de onboarding..."
curl -s http://localhost:5002/health
echo ""

echo "✅ Actualización completada!"
echo "🌐 Frontend: http://3.141.40.201:3000"
echo "🔧 Backend: http://3.141.40.201:5002"

EOF

echo "🎯 Para probar el onboarding:"
echo "1. Ve a http://3.141.40.201:3000"
echo "2. Inicia sesión con:"
echo "   - Cliente: cliente1@mineraandes.cl / password123"
echo "   - Proveedor: juan.perez@solucioneshidraulicas.cl / password123"
echo "3. Deberías ver el onboarding automáticamente" 