#!/bin/bash

# Script final para actualizar el servidor EC2 con onboarding funcionando
echo "🚀 Actualizando servidor EC2 con onboarding completo..."

# Configuración
EC2_IP="3.141.40.201"
EC2_USER="ubuntu"

echo "📡 Conectando a EC2..."
echo "⚠️  Necesitas ejecutar estos comandos manualmente en el servidor EC2:"
echo ""
echo "1. Conectarse al servidor:"
echo "   ssh -i tu-clave.pem ubuntu@3.141.40.201"
echo ""
echo "2. Ir al directorio del proyecto:"
echo "   cd /home/ubuntu/vantage-backend"
echo ""
echo "3. Actualizar código desde GitHub:"
echo "   git pull origin main"
echo ""
echo "4. Limpiar caché de Next.js:"
echo "   cd vantageai-frontend"
echo "   rm -rf .next"
echo "   cd .."
echo ""
echo "5. Reconstruir contenedores Docker:"
echo "   docker compose down"
echo "   docker compose up --build -d"
echo ""
echo "6. Esperar que los servicios estén listos (30 segundos):"
echo "   sleep 30"
echo ""
echo "7. Verificar estado:"
echo "   docker compose ps"
echo "   curl http://localhost:5002/health"
echo ""
echo "✅ Después de estos pasos, el onboarding debería funcionar en:"
echo "   http://3.141.40.201:3000"
echo ""
echo "🧪 Para probar:"
echo "   1. Ve a http://3.141.40.201:3000"
echo "   2. Inicia sesión con:"
echo "      - Cliente: cliente1@mineraandes.cl / password123"
echo "      - Proveedor: juan.perez@solucioneshidraulicas.cl / password123"
echo "   3. Deberías ver el onboarding automáticamente" 