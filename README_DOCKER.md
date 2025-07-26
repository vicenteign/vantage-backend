# 🐳 VANTAGE - Docker Setup

Este documento explica cómo ejecutar VANTAGE usando Docker y Docker Compose.

## 📋 Prerrequisitos

- **Docker Desktop** instalado y ejecutándose
- **Docker Compose** (incluido con Docker Desktop)
- Al menos **4GB de RAM** disponible
- **Git** para clonar el repositorio

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
# Dar permisos de ejecución al script
chmod +x scripts/docker-setup.sh

# Ejecutar el script
./scripts/docker-setup.sh
```

El script te guiará a través de un menú interactivo para:
- Ejecutar en modo producción
- Ejecutar en modo desarrollo
- Ejecutar con Nginx
- Ver logs
- Limpiar contenedores

### Opción 2: Comandos Manuales

#### Modo Producción
```bash
# Construir y ejecutar
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

#### Modo Desarrollo
```bash
# Construir y ejecutar con hot reload
docker-compose -f docker-compose.dev.yml up --build -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### Con Nginx (Producción)
```bash
# Ejecutar con reverse proxy
docker-compose --profile nginx up --build -d
```

## 🌐 Acceso a la Aplicación

### Sin Nginx
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002

### Con Nginx
- **Aplicación principal**: http://localhost
- **Frontend directo**: http://localhost:3000
- **Backend directo**: http://localhost:5002

## 📁 Estructura de Archivos Docker

```
VANTAGE/
├── Dockerfile.backend          # Backend Flask
├── Dockerfile.frontend         # Frontend Next.js (producción)
├── Dockerfile.frontend.dev     # Frontend Next.js (desarrollo)
├── docker-compose.yml          # Configuración principal
├── docker-compose.dev.yml      # Configuración desarrollo
├── nginx.conf                  # Configuración Nginx
├── .dockerignore               # Archivos a ignorar
├── scripts/
│   └── docker-setup.sh         # Script de setup
└── README_DOCKER.md           # Este archivo
```

## 🔧 Configuración

### Variables de Entorno

#### Backend
```bash
FLASK_APP=run_backend.py
FLASK_ENV=production|development
DATABASE_URL=sqlite:///instance/vantageai.db
JWT_SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
```

#### Frontend
```bash
NODE_ENV=production|development
NEXT_PUBLIC_API_URL=http://localhost:5002
```

### Volúmenes

- `./instance` → Base de datos SQLite
- `./static` → Archivos estáticos y uploads
- `./vantageai-frontend` → Código del frontend (desarrollo)

## 🛠️ Comandos Útiles

### Gestión de Contenedores
```bash
# Ver contenedores ejecutándose
docker-compose ps

# Detener contenedores
docker-compose down

# Reiniciar contenedores
docker-compose restart

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Gestión de Imágenes
```bash
# Reconstruir imágenes
docker-compose build --no-cache

# Ver imágenes
docker images

# Limpiar imágenes no utilizadas
docker system prune -a
```

### Base de Datos
```bash
# Ejecutar migraciones
docker-compose exec backend python -m flask db upgrade

# Crear migración
docker-compose exec backend python -m flask db migrate -m "descripción"

# Resetear base de datos
docker-compose exec backend python -m flask db downgrade base
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Ver qué está usando el puerto
lsof -i :3000
lsof -i :5002

# Detener proceso
kill -9 <PID>
```

#### 2. Permisos de archivos
```bash
# Dar permisos a directorios
chmod -R 755 instance/
chmod -R 755 static/
```

#### 3. Memoria insuficiente
```bash
# Aumentar memoria en Docker Desktop
# Settings → Resources → Memory → 4GB+
```

#### 4. Base de datos corrupta
```bash
# Eliminar base de datos y recrear
rm instance/vantageai.db
docker-compose up --build
```

### Logs de Error

#### Backend no inicia
```bash
# Ver logs detallados
docker-compose logs backend

# Verificar dependencias
docker-compose exec backend pip list
```

#### Frontend no inicia
```bash
# Ver logs detallados
docker-compose logs frontend

# Verificar node_modules
docker-compose exec frontend ls -la node_modules
```

#### Nginx no funciona
```bash
# Verificar configuración
docker-compose exec nginx nginx -t

# Ver logs
docker-compose logs nginx
```

## 🚀 Despliegue en Producción

### 1. Configurar Variables de Entorno
```bash
# Crear archivo .env
cp .env.example .env

# Editar variables
nano .env
```

### 2. Configurar SSL (Opcional)
```bash
# Agregar certificados SSL
mkdir -p ssl/
# Copiar certificados a ssl/
```

### 3. Ejecutar con Nginx
```bash
docker-compose --profile nginx up --build -d
```

### 4. Configurar Firewall
```bash
# Permitir puertos
sudo ufw allow 80
sudo ufw allow 443
```

## 📊 Monitoreo

### Health Checks
Los servicios incluyen health checks automáticos:
- Backend: http://localhost:5002/health
- Frontend: http://localhost:3000

### Métricas
```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=100
```

## 🔄 Actualizaciones

### Actualizar Código
```bash
# Pull cambios
git pull origin main

# Reconstruir y reiniciar
docker-compose down
docker-compose up --build -d
```

### Actualizar Dependencias
```bash
# Backend
docker-compose exec backend pip install -r requirements.txt

# Frontend
docker-compose exec frontend npm install
```

## 🧹 Limpieza

### Limpieza Completa
```bash
# Detener y eliminar todo
docker-compose down --rmi all --volumes --remove-orphans

# Limpiar sistema Docker
docker system prune -a -f

# Eliminar directorios temporales
rm -rf instance/
rm -rf static/uploads/
```

### Limpieza Parcial
```bash
# Solo contenedores
docker-compose down

# Solo imágenes no utilizadas
docker image prune -f
```

## 📞 Soporte

Si encuentras problemas:

1. **Verificar logs**: `docker-compose logs -f`
2. **Revisar configuración**: Verificar puertos y variables de entorno
3. **Reconstruir**: `docker-compose build --no-cache`
4. **Limpiar**: Ejecutar limpieza completa

## 🎯 Próximos Pasos

- [ ] Configurar CI/CD con GitHub Actions
- [ ] Agregar monitoreo con Prometheus/Grafana
- [ ] Implementar backup automático de base de datos
- [ ] Configurar múltiples entornos (staging, production)

---

**Estado**: ✅ Listo para producción  
**Versión**: 1.0  
**Última actualización**: Diciembre 2024 