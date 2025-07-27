# 🔧 Solución para Problemas de Backend en EC2

## Problema Identificado
- Error: `ERR_CONNECTION_REFUSED` en `localhost:5002/auth/login`
- Archivos de prueba no encontrados en el contenedor: `No such file or directory`

## Solución Paso a Paso

### 1. 🔄 Reconstruir el Contenedor con Archivos de Prueba

```bash
# Detener los contenedores
docker-compose -f docker-compose.prod.yml down

# Reconstruir el backend con los archivos de prueba
docker-compose -f docker-compose.prod.yml build backend-prod

# Levantar los servicios
docker-compose -f docker-compose.prod.yml up -d

# Verificar que estén ejecutándose
docker-compose -f docker-compose.prod.yml ps
```

### 2. 📁 Copiar Archivos de Prueba (Solución Alternativa)

Si no quieres reconstruir, puedes copiar los archivos manualmente:

```bash
# Copiar archivos de prueba al contenedor
docker-compose -f docker-compose.prod.yml cp create_test_user.py backend-prod:/app/
docker-compose -f docker-compose.prod.yml cp create_test_client.py backend-prod:/app/
docker-compose -f docker-compose.prod.yml cp fix_passwords.py backend-prod:/app/
docker-compose -f docker-compose.prod.yml cp simple_populate.py backend-prod:/app/
```

### 3. 🔍 Verificar Conectividad del Backend

```bash
# Verificar que el backend esté ejecutándose
docker-compose -f docker-compose.prod.yml logs backend-prod

# Probar conectividad
curl http://localhost:5002/health

# Verificar puertos
netstat -tulpn | grep :5002
```

### 4. 🧪 Ejecutar Scripts de Prueba

```bash
# Crear usuario de prueba
docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_user.py

# Crear cliente de prueba
docker-compose -f docker-compose.prod.yml exec backend-prod python create_test_client.py

# Verificar que funcionen
docker-compose -f docker-compose.prod.yml exec backend-prod python -c "
from vantage_backend import create_app
app = create_app()
print('Backend iniciado correctamente')
"
```

### 5. 🔧 Scripts Automatizados

Se han creado los siguientes scripts para facilitar el proceso:

#### `ec2_backend_fix.sh` - Solución completa automática
```bash
chmod +x ec2_backend_fix.sh
./ec2_backend_fix.sh
```

#### `copy_test_files.sh` - Solo copiar archivos
```bash
chmod +x copy_test_files.sh
./copy_test_files.sh
```

#### `fix_backend_connection.sh` - Diagnóstico
```bash
chmod +x fix_backend_connection.sh
./fix_backend_connection.sh
```

## 🔍 Diagnóstico de Problemas

### Verificar Logs del Backend
```bash
docker-compose -f docker-compose.prod.yml logs -f backend-prod
```

### Verificar Variables de Entorno
```bash
docker-compose -f docker-compose.prod.yml exec backend-prod env | grep -E '(DATABASE|JWT|OPENAI)'
```

### Verificar Base de Datos
```bash
docker-compose -f docker-compose.prod.yml exec backend-prod python -c "
from vantage_backend.models import db
from vantage_backend import create_app
app = create_app()
with app.app_context():
    try:
        db.engine.execute('SELECT 1')
        print('✅ Base de datos conectada')
    except Exception as e:
        print(f'❌ Error de base de datos: {e}')
"
```

## 🚨 Problemas Comunes y Soluciones

### 1. Puerto 5002 no disponible
```bash
# Verificar qué está usando el puerto
sudo lsof -i :5002

# Matar proceso si es necesario
sudo kill -9 <PID>
```

### 2. Base de datos no conecta
```bash
# Verificar estado de PostgreSQL
docker-compose -f docker-compose.prod.yml ps postgres-prod

# Reiniciar PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres-prod
```

### 3. Variables de entorno incorrectas
```bash
# Verificar archivo .env
cat .env

# Recrear si es necesario
./create_env.sh
```

## ✅ Verificación Final

Después de aplicar las soluciones, verifica:

1. **Backend responde**: `curl http://localhost:5002/health`
2. **Frontend puede conectarse**: Probar login en la interfaz
3. **Archivos de prueba funcionan**: Ejecutar `create_test_user.py`
4. **Base de datos conecta**: Verificar en logs del backend

## 📞 Comandos de Emergencia

Si nada funciona:

```bash
# Reinicio completo
docker-compose -f docker-compose.prod.yml down
docker system prune -f
docker-compose -f docker-compose.prod.yml up -d

# Verificar después de 30 segundos
sleep 30
curl http://localhost:5002/health
``` 