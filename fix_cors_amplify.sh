#!/bin/bash

echo "🔧 Arreglando configuración de CORS para Amplify..."

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.ec2.env.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.ec2.env.yml"
    exit 1
fi

# Crear nuevo archivo .env con CORS actualizado
echo "📝 Creando nuevo archivo .env con CORS para Amplify..."

cat > .env << 'EOF'
# Variables de entorno para producción con dominio vantage.estebanvalencia.cl
# Copiar este archivo como .env en el servidor

# PostgreSQL Configuration
POSTGRES_DB=vantageai
POSTGRES_USER=vantage_user
POSTGRES_PASSWORD=VantageSecure2024

# Backend Configuration
FLASK_APP=run_backend.py
FLASK_ENV=production
DATABASE_URL=postgresql://vantage_user:VantageSecure2024@postgres:5432/vantageai

# JWT Configuration
JWT_SECRET_KEY=VantageJWTSecret2024

# API Keys
OPENAI_API_KEY=tu-api-key-de-openai-aqui

# CORS Configuration para Amplify y dominio
CORS_ORIGINS=https://main.df2phit6iet5t.amplifyapp.com,https://vantage.estebanvalencia.cl,http://localhost:3000,https://*.amplifyapp.com,https://*.amplify.aws

# Logging
LOG_LEVEL=INFO
EOF

echo "✅ Archivo .env actualizado con CORS para Amplify"

# Verificar el contenido
echo "📋 Contenido del archivo .env:"
cat .env

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
docker-compose -f docker-compose.ec2.env.yml --env-file .env down
docker-compose -f docker-compose.ec2.env.yml --env-file .env up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar que el backend esté funcionando
echo "🔍 Verificando que el backend esté funcionando..."
if curl -f http://localhost:5002/health > /dev/null 2>&1; then
    echo "✅ Backend está funcionando correctamente"
else
    echo "❌ Backend no responde. Revisando logs..."
    docker-compose -f docker-compose.ec2.env.yml --env-file .env logs backend
fi

# Verificar configuración de CORS
echo "🔍 Verificando configuración de CORS..."
curl -H "Origin: https://main.df2phit6iet5t.amplifyapp.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5002/health

echo ""
echo "🎉 Configuración de CORS actualizada!"
echo "🌐 Frontend Amplify: https://main.df2phit6iet5t.amplifyapp.com"
echo "🔧 Backend: https://vantage.estebanvalencia.cl" 