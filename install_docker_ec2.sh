#!/bin/bash

# Script para instalar Docker y Docker Compose en EC2 Ubuntu
echo "🐳 Instalando Docker y Docker Compose en EC2..."

# Función para mostrar mensajes de estado
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Actualizar sistema
log "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
log "🔧 Instalando dependencias..."
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar GPG key de Docker
log "🔑 Agregando GPG key de Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio de Docker
log "📚 Agregando repositorio de Docker..."
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar repositorios
sudo apt update

# Instalar Docker
log "🐳 Instalando Docker..."
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Agregar usuario al grupo docker
log "👤 Agregando usuario al grupo docker..."
sudo usermod -aG docker $USER

# Instalar Docker Compose
log "📋 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear symlink para docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Iniciar y habilitar Docker
log "🚀 Iniciando servicio Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# Verificar instalación
log "🔍 Verificando instalación..."
docker --version
docker-compose --version

echo ""
echo "✅ ¡Docker y Docker Compose instalados exitosamente!"
echo ""
echo "⚠️  IMPORTANTE: Necesitas reiniciar la sesión para que los cambios de grupo surtan efecto."
echo "   Ejecuta: exit"
echo "   Luego reconecta: ssh -i tu-key.pem ubuntu@tu-ip-ec2"
echo ""
echo "🔍 Para verificar después de reconectar:"
echo "   docker --version"
echo "   docker-compose --version"
echo "   docker ps" 