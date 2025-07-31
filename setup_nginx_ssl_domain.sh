#!/bin/bash

# Script para configurar Nginx con SSL para vantage.estebanvalencia.cl
echo "🌐 Configurando Nginx con SSL para vantage.estebanvalencia.cl..."

# Verificar que estamos como root o con sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse como root o con sudo"
    exit 1
fi

# Obtener la IP pública de la instancia
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "🌐 IP Pública detectada: $PUBLIC_IP"

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Instalar Certbot para SSL
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Crear configuración temporal de Nginx (sin SSL)
echo "⚙️ Creando configuración temporal de Nginx..."
cat > /etc/nginx/sites-available/vantage-api << EOF
server {
    listen 80;
    server_name vantage.estebanvalencia.cl;
    
    location / {
        proxy_pass http://localhost:5002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
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
        proxy_pass http://localhost:5002/health;
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
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configurado temporalmente en HTTP"
echo "🌐 Tu API está disponible en: http://vantage.estebanvalencia.cl"

# Verificar que el dominio resuelve correctamente
echo "🔍 Verificando resolución del dominio..."
nslookup vantage.estebanvalencia.cl

# Preguntar si quiere configurar SSL
echo ""
echo "🔐 ¿Quieres configurar SSL con Let's Encrypt?"
echo "1. Sí, configurar SSL automáticamente"
echo "2. No, mantener solo HTTP"
echo "3. Configurar SSL manualmente"

read -p "Selecciona una opción (1-3): " ssl_choice

case $ssl_choice in
    1)
        echo "🔐 Configurando SSL automáticamente..."
        
        # Verificar que el dominio resuelve a la IP correcta
        DOMAIN_IP=$(nslookup vantage.estebanvalencia.cl | grep "Address:" | tail -1 | awk '{print $2}')
        if [ "$DOMAIN_IP" = "$PUBLIC_IP" ]; then
            echo "✅ Dominio resuelve correctamente a la IP del servidor"
            
            # Obtener certificado SSL
            certbot --nginx -d vantage.estebanvalencia.cl --non-interactive --agree-tos --email admin@estebanvalencia.cl
            
            # Configurar renovación automática
            echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
            
            echo "✅ SSL configurado para vantage.estebanvalencia.cl"
            echo "🔐 Tu API está disponible en: https://vantage.estebanvalencia.cl"
        else
            echo "❌ El dominio no resuelve a la IP correcta"
            echo "💡 IP del dominio: $DOMAIN_IP"
            echo "💡 IP del servidor: $PUBLIC_IP"
            echo "🌐 Tu API seguirá funcionando en HTTP: http://vantage.estebanvalencia.cl"
        fi
        ;;
    2)
        echo "✅ Manteniendo configuración HTTP"
        echo "🌐 Tu API está disponible en: http://vantage.estebanvalencia.cl"
        ;;
    3)
        echo "📋 Para configurar SSL manualmente:"
        echo "1. Asegúrate de que vantage.estebanvalencia.cl apunte a $PUBLIC_IP"
        echo "2. Ejecuta: certbot --nginx -d vantage.estebanvalencia.cl"
        echo "3. Configura renovación automática: crontab -e"
        ;;
    *)
        echo "❌ Opción inválida"
        ;;
esac

echo ""
echo "🎉 Configuración completada!"
echo "📊 Información de tu API:"
echo "   - URL: http://vantage.estebanvalencia.cl (o https:// si configuraste SSL)"
echo "   - Health Check: http://vantage.estebanvalencia.cl/health"
echo "   - Backend corriendo en puerto 5002"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: sudo tail -f /var/log/nginx/access.log"
echo "   - Reiniciar Nginx: sudo systemctl restart nginx"
echo "   - Verificar estado: sudo systemctl status nginx"
echo "   - Verificar SSL: sudo certbot certificates" 