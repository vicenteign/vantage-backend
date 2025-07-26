# 🚀 Guía de Despliegue en EC2 t3.small

## 📋 Requisitos Previos

### 🖥️ Instancia EC2:
- **Tipo**: t3.small (2 vCPUs, 2GB RAM)
- **Sistema Operativo**: Ubuntu 22.04 LTS
- **Almacenamiento**: Mínimo 20GB EBS
- **Seguridad**: Puertos 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000, 5002

## 🔧 Configuración de la Instancia EC2

### 1. 🚀 Lanzar Instancia
```bash
# Conectar a tu instancia EC2
ssh -i tu-key.pem ubuntu@tu-ip-ec2
```

### 2. 📦 Instalar Dependencias
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Git
sudo apt install git -y

# Reiniciar sesión para aplicar cambios de grupo
exit
# Reconectar: ssh -i tu-key.pem ubuntu@tu-ip-ec2
```

### 3. 🔒 Configurar Firewall
```bash
# Configurar Security Groups en AWS Console:
# - SSH (22): Tu IP
# - HTTP (80): 0.0.0.0/0
# - HTTPS (443): 0.0.0.0/0
# - Custom TCP (3000): 0.0.0.0/0
# - Custom TCP (5002): 0.0.0.0/0
```

## 📁 Preparar el Código

### 1. 📥 Clonar el Repositorio
```bash
# En tu máquina local
git add .
git commit -m "Preparar para despliegue en EC2"
git push origin main

# En EC2
git clone https://github.com/tu-usuario/vantage.git
cd vantage
```

### 2. ⚙️ Configurar Variables de Entorno (IMPORTANTE)
```bash
# 🎯 ORDEN CORRECTO:
# 1. Crear archivo .env
./create_env.sh

# 2. Editar .env con tus configuraciones
nano .env

# 3. Configuraciones importantes a editar:
#    - OPENAI_API_KEY=tu_clave_real_aqui
#    - CORS_ORIGINS=tu_dominio_o_ip_aqui
```

## 🚀 Desplegar la Aplicación

### 1. 🔨 Ejecutar Script de Despliegue
```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar despliegue (requiere .env creado)
./deploy.sh
```

### 2. 🔍 Verificar Despliegue
```bash
# Verificar que los contenedores estén corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Verificar que los puertos estén abiertos
sudo netstat -tlnp | grep -E ':(3000|5002)'
```

## 🌐 Configurar Dominio (Opcional)

### 1. 🔗 Configurar DNS
```bash
# Si tienes un dominio, apunta A record a tu IP de EC2
# Ejemplo: vantage.tudominio.com -> tu-ip-ec2
```

### 2. 🔒 Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot -y

# Obtener certificado SSL
sudo certbot certonly --standalone -d vantage.tudominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Mantenimiento

### 1. 📈 Monitorear Recursos
```bash
# Ver uso de CPU y memoria
htop

# Ver uso de disco
df -h

# Ver logs de Docker
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. 🔄 Actualizaciones
```bash
# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. 💾 Backups
```bash
# Crear backup de la base de datos
docker-compose -f docker-compose.prod.yml exec postgres-prod pg_dump -U vantage_user vantageai_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres-prod psql -U vantage_user vantageai_prod < backup_file.sql
```

## 🚨 Solución de Problemas

### Error: Puerto ya en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
sudo lsof -i :5002

# Matar proceso si es necesario
sudo kill -9 PID
```

### Error: Sin memoria
```bash
# Ver uso de memoria
free -h

# Limpiar Docker
docker system prune -a -f
```

### Error: Base de datos no conecta
```bash
# Verificar logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres-prod

# Verificar conectividad
docker-compose -f docker-compose.prod.yml exec backend-prod ping postgres-prod
```

### Error: Archivo .env no encontrado
```bash
# Crear archivo .env
./create_env.sh

# Editar configuración
nano .env

# Volver a ejecutar despliegue
./deploy.sh
```

## 📝 Comandos Útiles

```bash
# Ver estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs backend-prod

# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart backend-prod

# Detener todos los servicios
docker-compose -f docker-compose.prod.yml down

# Ver uso de recursos de contenedores
docker stats

# Entrar a un contenedor
docker-compose -f docker-compose.prod.yml exec backend-prod bash
```

## 🔗 URLs de Acceso

- **Frontend**: `http://tu-ip-ec2:3000`
- **Backend API**: `http://tu-ip-ec2:5002`
- **Con dominio**: `https://vantage.tudominio.com`

## 💰 Estimación de Costos (t3.small)

- **EC2 t3.small**: ~$15-20/mes
- **EBS 20GB**: ~$2/mes
- **Transferencia de datos**: ~$1-5/mes
- **Total estimado**: ~$20-30/mes

## 🎯 Próximos Pasos

1. **Configurar monitoreo** (CloudWatch, Prometheus)
2. **Implementar CI/CD** (GitHub Actions, AWS CodePipeline)
3. **Configurar load balancer** (ALB) para escalabilidad
4. **Implementar backup automático** (RDS, S3)
5. **Configurar alertas** (SNS, CloudWatch Alarms) 