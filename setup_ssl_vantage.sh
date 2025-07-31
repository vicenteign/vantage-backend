#!/bin/bash

echo "🔒 Configurando SSL para vantage.estebanvalencia.cl..."

# Verificar que estamos como root o con sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root o con sudo"
    exit 1
fi

# Verificar que el dominio apunte al servidor
echo "🔍 Verificando que el dominio apunte al servidor..."
SERVER_IP=$(curl -s ifconfig.me)
echo "🌐 IP del servidor: $SERVER_IP"

# Instalar Certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Verificar que Nginx esté corriendo
if ! systemctl is-active --quiet nginx; then
    echo "❌ Nginx no está corriendo. Iniciando..."
    systemctl start nginx
fi

# Crear configuración temporal de Nginx para el certificado
echo "📝 Creando configuración temporal de Nginx..."
cat > /etc/nginx/sites-available/vantage.estebanvalencia.cl << 'EOF'
server {
    listen 80;
    server_name vantage.estebanvalencia.cl;

    location / {
        proxy_pass http://localhost:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/vantage.estebanvalencia.cl /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Obtener certificado SSL
echo "🔒 Obteniendo certificado SSL..."
certbot --nginx -d vantage.estebanvalencia.cl --non-interactive --agree-tos --email admin@estebanvalencia.cl

# Verificar que el certificado se obtuvo correctamente
if [ -f "/etc/letsencrypt/live/vantage.estebanvalencia.cl/fullchain.pem" ]; then
    echo "✅ Certificado SSL obtenido correctamente"
else
    echo "❌ Error al obtener el certificado SSL"
    echo "🔍 Verificando logs de Certbot..."
    journalctl -u certbot --since "5 minutes ago"
    exit 1
fi

# Verificar que Nginx esté funcionando con SSL
echo "🔍 Verificando configuración de Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Nginx válida"
    systemctl reload nginx
else
    echo "❌ Error en la configuración de Nginx"
    exit 1
fi

# Verificar que el sitio responda con HTTPS
echo "🔍 Verificando que el sitio responda con HTTPS..."
sleep 5
if curl -f https://vantage.estebanvalencia.cl/health > /dev/null 2>&1; then
    echo "✅ Sitio responde correctamente con HTTPS"
else
    echo "❌ Sitio no responde con HTTPS"
    echo "🔍 Verificando logs de Nginx..."
    tail -n 10 /var/log/nginx/error.log
fi

echo ""
echo "🎉 SSL configurado correctamente!"
echo "🌐 URL del sitio: https://vantage.estebanvalencia.cl"
echo "🔒 Certificado válido hasta: $(certbot certificates | grep 'VALID')"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar que el frontend pueda conectarse al backend"
echo "2. Probar login y funcionalidades principales"
echo "3. Configurar renovación automática del certificado" 