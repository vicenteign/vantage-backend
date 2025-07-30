#!/bin/bash

# Script para configurar el repositorio del frontend separado
echo "🚀 Configurando repositorio del frontend..."

# Verificar que estamos en el directorio correcto
if [ ! -d "vantageai-frontend" ]; then
    echo "❌ Error: No se encontró el directorio vantageai-frontend"
    exit 1
fi

# Navegar al directorio del frontend
cd vantageai-frontend

# Inicializar git si no existe
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositorio git..."
    git init
fi

# Verificar si ya hay un remote configurado
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️ No hay remote configurado. Por favor, agrega tu repositorio:"
    echo "git remote add origin https://github.com/tu-usuario/vantageai-frontend.git"
fi

# Verificar estado del repositorio
echo "📊 Estado del repositorio:"
git status

# Mostrar información sobre la configuración
echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crear repositorio en GitHub: vantageai-frontend"
echo "2. Agregar remote: git remote add origin https://github.com/tu-usuario/vantageai-frontend.git"
echo "3. Hacer commit inicial:"
echo "   git add ."
echo "   git commit -m 'Initial commit - Frontend separated'"
echo "4. Push al repositorio: git push -u origin main"
echo ""
echo "🌐 Para Amplify:"
echo "1. Conectar el repositorio vantageai-frontend a Amplify"
echo "2. Configurar variable de entorno: NEXT_PUBLIC_API_URL=https://tu-ip-ec2:5002"
echo "3. Usar el archivo amplify.yml para la configuración de build" 