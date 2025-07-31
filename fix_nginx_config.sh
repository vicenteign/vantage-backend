#!/bin/bash

echo "🔧 Corrigiendo configuración de Nginx para Docker..."

# Verificar que estamos como root o con sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root o con sudo"
    exit 1
fi

# Obtener la IP del contenedor backend
echo "🔍 Obteniendo IP del contenedor backend..."
BACKEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vantage-backend-1)
echo "📍 IP del backend: $BACKEND_IP"

# Crear configuración corregida de Nginx
echo "📝 Creando configuración corregida de Nginx..."
cat > /etc/nginx/sites-available/vantage-api << EOF
server {
    listen 80;
    server_name vantage.estebanvalencia.cl;
    
    # Configuración de proxy para el backend Docker
    location / {
        proxy_pass http://$BACKEND_IP:5002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Configuración de timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://$BACKEND_IP:5002/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://$BACKEND_IP:5002/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/vantage-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
echo "🔍 Verificando configuración de Nginx..."
nginx -t

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# Verificar estado
echo "📊 Estado de Nginx:"
systemctl status nginx

# Probar conexión
echo "🔍 Probando conexión..."
sleep 2
curl -f http://localhost/health && echo "✅ Nginx conecta correctamente al backend" || echo "❌ Nginx no puede conectar al backend"

echo "🎉 Configuración de Nginx corregida!"
echo "🌐 Tu API está disponible en: http://vantage.estebanvalencia.cl" 