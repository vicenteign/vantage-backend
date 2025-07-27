#!/bin/bash

# Script para configurar el frontend para EC2
echo "🌐 Configurando frontend para EC2..."

# Obtener IP pública
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
if [ -z "$EC2_PUBLIC_IP" ]; then
    EC2_PUBLIC_IP=$(curl -s ifconfig.me)
fi

echo "✅ IP Pública: $EC2_PUBLIC_IP"

# Verificar que el archivo api.js existe
if [ ! -f "vantageai-frontend/app/lib/api.js" ]; then
    echo "❌ Archivo api.js no encontrado"
    exit 1
fi

# Crear backup del archivo original
cp vantageai-frontend/app/lib/api.js vantageai-frontend/app/lib/api.js.backup
echo "✅ Backup creado: api.js.backup"

# Crear configuración específica para EC2
cat > vantageai-frontend/app/lib/api.js << 'EOF'
import axios from 'axios';

// Configuración específica para EC2
const EC2_PUBLIC_IP = 'EC2_IP_PLACEHOLDER'; // Se reemplazará automáticamente
const BACKEND_URL = `http://${EC2_PUBLIC_IP}:5002`;

console.log('🌐 Configuración EC2 - Backend URL:', BACKEND_URL);

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Revisa si estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token agregado al header:', config.headers['Authorization']);
      } else {
        console.log('⚠️ No se encontró token en localStorage');
      }
    }
    
    console.log('📡 Request a:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitosa:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
EOF

# Reemplazar el placeholder con la IP real
sed -i "s/EC2_IP_PLACEHOLDER/$EC2_PUBLIC_IP/g" vantageai-frontend/app/lib/api.js
echo "✅ IP pública configurada: $EC2_PUBLIC_IP"

# Reconstruir el frontend
echo "🔨 Reconstruyendo frontend..."
docker-compose -f docker-compose.prod.yml build frontend-prod
docker-compose -f docker-compose.prod.yml up -d frontend-prod

echo ""
echo "🎉 Frontend configurado para EC2!"
echo "================================"
echo ""
echo "📱 URLs de acceso:"
echo "Frontend: http://$EC2_PUBLIC_IP:3000"
echo "Backend: http://$EC2_PUBLIC_IP:5002"
echo ""
echo "🔧 Para verificar:"
echo "1. Abre http://$EC2_PUBLIC_IP:3000 en tu navegador"
echo "2. Abre la consola del navegador (F12)"
echo "3. Deberías ver: '🌐 Configuración EC2 - Backend URL: http://$EC2_PUBLIC_IP:5002'"
echo "4. Intenta hacer login"
echo ""
echo "📋 Si necesitas revertir los cambios:"
echo "cp vantageai-frontend/app/lib/api.js.backup vantageai-frontend/app/lib/api.js" 