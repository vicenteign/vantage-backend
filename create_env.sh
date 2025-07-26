#!/bin/bash

# Script para crear archivo .env para producción
echo "🔧 Creando archivo .env para producción..."

# Verificar si .env ya existe
if [ -f .env ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Deseas sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Generar JWT secret key
JWT_SECRET=$(openssl rand -hex 32)

# Crear archivo .env
cat > .env << EOF
# ========================================
# VANTAGE - Variables de Entorno Producción
# ========================================

# 🔐 JWT Secret Key (generado automáticamente)
JWT_SECRET_KEY=${JWT_SECRET}

# 🤖 OpenAI API Key (configurar manualmente)
OPENAI_API_KEY=your_openai_api_key_here

# 🌍 Entorno
NODE_ENV=production
FLASK_ENV=production

# 📊 Base de Datos (configurado en docker-compose)
DATABASE_URL=postgresql://vantage_user:vantage_password_prod@postgres-prod:5432/vantageai_prod

# 🔒 Configuración de Seguridad
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5002,http://127.0.0.1:5002

# 📝 Logs
LOG_LEVEL=INFO

# 🚀 Configuración del Servidor
HOST=0.0.0.0
PORT=5002
EOF

echo "✅ Archivo .env creado exitosamente!"
echo ""
echo "📝 IMPORTANTE: Edita el archivo .env y configura:"
echo "   - OPENAI_API_KEY: Tu clave de API de OpenAI"
echo "   - CORS_ORIGINS: URLs permitidas para CORS"
echo ""
echo "🔍 Contenido del archivo .env:"
echo "========================================"
cat .env
echo "========================================" 