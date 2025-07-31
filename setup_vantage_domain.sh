#!/bin/bash

echo "🌐 Configurando dominio vantage.estebanvalencia.cl..."

# Verificar que estamos como root o con sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root o con sudo"
    exit 1
fi

# Verificar que el backend esté corriendo
echo "🔍 Verificando que el backend esté corriendo..."
if ! docker ps | grep -q backend; then
    echo "❌ El backend no está corriendo. Iniciando..."
    cd /home/ubuntu/vantage
    docker-compose -f docker-compose.ec2.env.yml --env-file .env up -d
    sleep 10
fi

# Verificar que el backend responda
echo "🔍 Verificando respuesta del backend..."
if curl -f http://localhost:5002/health > /dev/null 2>&1; then
    echo "✅ Backend responde correctamente"
else
    echo "❌ Backend no responde. Revisando logs..."
    docker-compose -f docker-compose.ec2.env.yml --env-file .env logs backend
    exit 1
fi

# Crear configuración de Nginx
echo "📝 Creando configuración de Nginx..."
cat > /etc/nginx/sites-available/vantage.estebanvalencia.cl << 'EOF'
server {
    listen 80;
    server_name vantage.estebanvalencia.cl;
    
    # Configuración de proxy para el backend Docker
    location / {
        proxy_pass http://localhost:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Configuración de timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
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
        proxy_pass http://localhost:5002/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:5002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar el sitio
echo "🔗 Habilitando sitio..."
ln -sf /etc/nginx/sites-available/vantage.estebanvalencia.cl /etc/nginx/sites-enabled/

# Verificar configuración
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
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx conecta correctamente al backend"
else
    echo "❌ Nginx no puede conectar al backend"
    echo "🔍 Revisando logs de error..."
    tail -n 10 /var/log/nginx/error.log
fi

echo "🎉 Configuración completada!"
echo "🌐 Tu API está disponible en: http://vantage.estebanvalencia.cl"
echo "🔍 Health check: http://vantage.estebanvalencia.cl/health" 