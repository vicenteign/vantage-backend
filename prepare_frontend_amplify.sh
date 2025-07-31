#!/bin/bash

echo "🚀 Preparando frontend para Amplify..."

# Verificar que estamos en el directorio correcto
if [ ! -d "vantageai-frontend" ]; then
    echo "❌ Error: No se encontró el directorio vantageai-frontend"
    exit 1
fi

# Navegar al directorio del frontend
cd vantageai-frontend

# Verificar que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Generar package-lock.json
echo "📦 Generando package-lock.json..."
npm install

# Verificar que se generó correctamente
if [ ! -f "package-lock.json" ]; then
    echo "❌ Error: No se pudo generar package-lock.json"
    exit 1
fi

echo "✅ package-lock.json generado correctamente"

# Verificar que amplify.yml existe
if [ ! -f "amplify.yml" ]; then
    echo "📝 Creando amplify.yml..."
    cat > amplify.yml << 'EOF'
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
EOF
    echo "✅ amplify.yml creado"
else
    echo "✅ amplify.yml ya existe"
fi

# Verificar estado del repositorio git
echo "📊 Estado del repositorio:"
git status

# Mostrar archivos que se agregarán
echo "📋 Archivos que se agregarán al commit:"
git status --porcelain

# Preguntar si quiere hacer commit y push
echo ""
echo "¿Quieres hacer commit y push de los cambios?"
echo "1. Sí, hacer commit y push"
echo "2. No, solo mostrar los cambios"
read -p "Selecciona una opción (1-2): " choice

case $choice in
    1)
        echo "📝 Haciendo commit..."
        git add .
        git commit -m "Prepare frontend for Amplify deployment - Add package-lock.json and update amplify.yml"
        
        echo "🚀 Haciendo push..."
        git push origin main
        
        echo "✅ Cambios subidos al repositorio"
        ;;
    2)
        echo "📋 Cambios pendientes:"
        git status
        ;;
    *)
        echo "❌ Opción inválida"
        ;;
esac

echo ""
echo "🎉 Preparación completada!"
echo "📋 Próximos pasos:"
echo "1. En Amplify Console, configurar la variable de entorno:"
echo "   NEXT_PUBLIC_API_URL=https://vantage.estebanvalencia.cl"
echo "2. Conectar el repositorio a Amplify"
echo "3. Configurar el build settings para usar amplify.yml" 