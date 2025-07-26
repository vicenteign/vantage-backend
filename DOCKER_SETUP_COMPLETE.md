# 🐳 Vantage.ai - Configuración Docker Completa

## ✅ Estado Actual: **FUNCIONANDO CORRECTAMENTE**

La aplicación Vantage.ai ha sido completamente dockerizada y está funcionando correctamente con todos los servicios necesarios.

---

## 🚀 Servicios en Ejecución

### Backend (Flask)
- **Puerto**: 5002
- **URL**: http://localhost:5002
- **Estado**: ✅ Funcionando
- **Base de datos**: SQLite con datos de prueba poblados
- **Migraciones**: ✅ Aplicadas automáticamente

### Frontend (Next.js)
- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Estado**: ✅ Funcionando
- **Modo**: Desarrollo con hot-reload

---

## 📊 Datos de Prueba Incluidos

La base de datos se pobla automáticamente con:

- **12 Categorías** (Bombas, Equipos de Perforación, Seguridad Industrial, etc.)
- **3 Planes** (Básico, Profesional, Empresarial)
- **9 Usuarios** (5 proveedores + 4 clientes)
- **5 Perfiles de Proveedores** con información completa
- **4 Empresas Cliente** con sucursales
- **7 Productos** con detalles técnicos
- **5 Servicios** con modalidades

---

## 👤 Credenciales de Prueba

### Cliente
```
Email: cliente1@mineraandes.cl
Password: password123
```

### Proveedores
```
Email: juan.perez@solucioneshidraulicas.cl
Password: password123

Email: carlos.rodriguez@seguridadtotal.cl
Password: password123

Email: ana.martinez@drilltech.cl
Password: password123

Email: roberto.silva@tecmaq.cl
Password: password123

Email: patricia.vega@metricon.cl
Password: password123
```

---

## 🛠️ Comandos de Gestión

### Iniciar la aplicación
```bash
docker compose up -d
```

### Ver logs
```bash
# Todos los servicios
docker compose logs

# Solo backend
docker compose logs backend

# Solo frontend
docker compose logs frontend

# Seguir logs en tiempo real
docker compose logs -f
```

### Detener la aplicación
```bash
docker compose down
```

### Reconstruir (si hay cambios)
```bash
docker compose down
docker compose up --build -d
```

### Reiniciar un servicio específico
```bash
docker compose restart backend
docker compose restart frontend
```

---

## 🔧 Estructura de Archivos Docker

```
VANTAGE/
├── Dockerfile.backend          # Imagen del backend Flask
├── Dockerfile.frontend         # Imagen del frontend Next.js
├── docker-compose.yml          # Configuración de servicios
├── entrypoint.sh              # Script de inicialización del backend
├── requirements_clean.txt      # Dependencias Python limpias
├── populate_database.py       # Script de población de datos
└── .dockerignore              # Archivos ignorados por Docker
```

---

## 🌐 Endpoints Principales

### Backend API (http://localhost:5002)

#### Públicos
- `GET /catalog/public/products` - Lista de productos
- `GET /catalog/public/services` - Lista de servicios
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse

#### Autenticados
- `POST /api/ia/search-catalog` - Búsqueda IA
- `GET /client/dashboard` - Dashboard del cliente
- `GET /provider/dashboard` - Dashboard del proveedor

### Frontend (http://localhost:3000)
- `/` - Página principal
- `/auth/login` - Página de login
- `/auth/register` - Página de registro
- `/client/dashboard` - Dashboard del cliente
- `/client/products` - Productos (vista cliente)
- `/client/services` - Servicios (vista cliente)
- `/provider/dashboard` - Dashboard del proveedor

---

## 🔍 Verificación de Funcionamiento

### 1. Verificar que los contenedores estén corriendo
```bash
docker compose ps
```

### 2. Probar el backend
```bash
curl http://localhost:5002/catalog/public/products
```

### 3. Probar el frontend
```bash
curl http://localhost:3000
```

### 4. Probar login
```bash
curl -X POST http://localhost:5002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente1@mineraandes.cl", "password": "password123"}'
```

---

## 📝 Características Implementadas

### ✅ Backend
- [x] Flask con SQLAlchemy
- [x] Autenticación JWT
- [x] Migraciones automáticas con Alembic
- [x] Población automática de datos de prueba
- [x] API REST completa
- [x] Búsqueda IA con OpenAI
- [x] Manejo de archivos y uploads
- [x] CORS configurado

### ✅ Frontend
- [x] Next.js con TypeScript
- [x] Tailwind CSS para estilos
- [x] Componentes reutilizables
- [x] Rutas protegidas
- [x] Dashboard responsivo
- [x] Formularios de login/registro
- [x] Catálogo de productos/servicios
- [x] Sistema de cotizaciones
- [x] Efectos highlight en búsquedas

### ✅ Docker
- [x] Contenedores optimizados
- [x] Volúmenes persistentes
- [x] Variables de entorno
- [x] Health checks
- [x] Scripts de inicialización
- [x] Hot-reload en desarrollo

---

## 🚨 Solución de Problemas

### Si el backend no responde
```bash
# Verificar logs
docker compose logs backend

# Reiniciar backend
docker compose restart backend

# Si persiste, reconstruir
docker compose down
docker compose up --build -d
```

### Si el frontend no carga
```bash
# Verificar logs
docker compose logs frontend

# Reiniciar frontend
docker compose restart frontend
```

### Si la base de datos está vacía
```bash
# Entrar al contenedor y poblar manualmente
docker compose exec backend python populate_database.py
```

### Si hay problemas de permisos
```bash
# Verificar permisos de volúmenes
ls -la instance/
ls -la static/

# Corregir permisos si es necesario
chmod 755 instance/
chmod 755 static/
```

---

## 🎯 Próximos Pasos

1. **Configurar variables de entorno** para producción
2. **Implementar HTTPS** con certificados SSL
3. **Configurar backup** de la base de datos
4. **Optimizar imágenes** Docker para producción
5. **Implementar CI/CD** con GitHub Actions
6. **Configurar monitoreo** con Prometheus/Grafana

---

## 📞 Soporte

Si encuentras algún problema:

1. Verifica los logs: `docker compose logs`
2. Revisa la documentación de cada servicio
3. Asegúrate de que Docker Desktop esté corriendo
4. Verifica que los puertos 3000 y 5002 estén disponibles

---

**🎉 ¡La aplicación está lista para usar!**

Accede a http://localhost:3000 para comenzar a usar Vantage.ai 