# Separación de Responsabilidades - EC2 + Amplify

## Arquitectura Actualizada

### EC2 (Backend + Base de Datos)
- **PostgreSQL**: Base de datos principal
- **Backend Flask**: API REST en puerto 5002
- **Docker**: Contenedores para ambos servicios

### Amplify (Frontend)
- **Next.js**: Aplicación frontend
- **Deploy automático**: Desde GitHub
- **CDN**: Distribución global

## Configuración de EC2

### 1. Despliegue
```bash
# En tu instancia EC2
./deploy_ec2_backend.sh
```

### 2. Variables de Entorno
Crear archivo `.env` en EC2:
```env
OPENAI_API_KEY=tu-api-key-aqui
CORS_ORIGINS=https://tu-dominio-amplify.amplifyapp.com
JWT_SECRET_KEY=tu-jwt-secret-super-seguro
```

### 3. Puertos Abiertos
- **5002**: Backend API
- **5432**: PostgreSQL (solo acceso local)

## Configuración de Amplify

### 1. Conectar Repositorio
- Conectar el repositorio `vantageai-frontend` a Amplify
- Configurar build settings para Next.js

### 2. Variables de Entorno
En Amplify Console:
```
NEXT_PUBLIC_API_URL=https://tu-ip-ec2:5002
```

### 3. Build Settings
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
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
```

## Repositorios Separados

### Backend (Este repositorio)
- ✅ Incluye: Backend Flask, PostgreSQL, scripts de EC2
- ❌ Excluye: `vantageai-frontend/`

### Frontend (Repositorio separado)
- ✅ Incluye: Next.js, componentes, páginas
- ❌ Excluye: Backend, base de datos

## Comandos Útiles

### EC2
```bash
# Ver logs
docker-compose -f docker-compose.ec2.yml logs

# Reiniciar servicios
docker-compose -f docker-compose.ec2.yml restart

# Backup de base de datos
docker exec -t postgres pg_dumpall -c -U vantage_user > backup.sql
```

### Frontend (Local)
```bash
# Desarrollo local
cd vantageai-frontend
npm run dev

# Build para producción
npm run build
```

## CORS Configuration

El backend está configurado para aceptar requests desde:
- `http://localhost:3000` (desarrollo local)
- `https://tu-dominio-amplify.amplifyapp.com` (producción)

## Monitoreo

### Health Checks
- Backend: `http://tu-ip-ec2:5002/health`
- PostgreSQL: Verificar logs de Docker

### Logs
```bash
# Backend logs
docker-compose -f docker-compose.ec2.yml logs backend

# PostgreSQL logs
docker-compose -f docker-compose.ec2.yml logs postgres
```

## Troubleshooting

### Backend no responde
1. Verificar que Docker esté corriendo
2. Revisar logs: `docker-compose -f docker-compose.ec2.yml logs backend`
3. Verificar conectividad a PostgreSQL

### CORS Errors
1. Verificar variable `CORS_ORIGINS` en EC2
2. Asegurar que el dominio de Amplify esté incluido

### Base de datos no conecta
1. Verificar que PostgreSQL esté corriendo
2. Revisar logs: `docker-compose -f docker-compose.ec2.yml logs postgres`
3. Verificar credenciales en `DATABASE_URL` 