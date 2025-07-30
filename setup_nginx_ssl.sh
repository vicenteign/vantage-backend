#!/bin/bash

# Script para configurar Nginx con SSL en EC2
echo "🚀 Configurando Nginx con SSL..."

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
    server_name $PUBLIC_IP;
    
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
echo "🌐 Tu API está disponible en: http://$PUBLIC_IP"

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
        
        # Obtener dominio (opcional)
        read -p "¿Tienes un dominio configurado? (deja vacío para usar IP): " domain
        
        if [ -z "$domain" ]; then
            echo "⚠️ Sin dominio, usando IP pública. SSL no funcionará correctamente."
            echo "💡 Para SSL completo, necesitas un dominio apuntando a $PUBLIC_IP"
            echo "🌐 Tu API seguirá funcionando en HTTP: http://$PUBLIC_IP"
        else
            echo "🔐 Configurando SSL para dominio: $domain"
            
            # Actualizar configuración con el dominio
            sed -i "s/server_name $PUBLIC_IP;/server_name $domain;/" /etc/nginx/sites-available/vantage-api
            
            # Obtener certificado SSL
            certbot --nginx -d $domain --non-interactive --agree-tos --email admin@$domain
            
            # Verificar renovación automática
            echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
            
            echo "✅ SSL configurado para $domain"
            echo "🔐 Tu API está disponible en: https://$domain"
        fi
        ;;
    2)
        echo "✅ Manteniendo configuración HTTP"
        echo "🌐 Tu API está disponible en: http://$PUBLIC_IP"
        ;;
    3)
        echo "📋 Para configurar SSL manualmente:"
        echo "1. Configura un dominio apuntando a $PUBLIC_IP"
        echo "2. Ejecuta: certbot --nginx -d tu-dominio.com"
        echo "3. Configura renovación automática: crontab -e"
        ;;
    *)
        echo "❌ Opción inválida"
        ;;
esac

echo ""
echo "🎉 Configuración completada!"
echo "📊 Información de tu API:"
echo "   - URL: http://$PUBLIC_IP (o https://tu-dominio.com si configuraste SSL)"
echo "   - Health Check: http://$PUBLIC_IP/health"
echo "   - Backend corriendo en puerto 5002"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: sudo tail -f /var/log/nginx/access.log"
echo "   - Reiniciar Nginx: sudo systemctl restart nginx"
echo "   - Verificar estado: sudo systemctl status nginx" 