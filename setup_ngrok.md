# 🚀 Configuración de Ngrok para Vantage

## 📋 Pasos para exponer tu aplicación a través de ngrok

### 1. 🔧 Configurar el Backend (Ya hecho)
El backend ya está configurado para aceptar conexiones desde ngrok.

### 2. 🌐 Exponer el Backend
Abre una **nueva terminal** y ejecuta:
```bash
ngrok http 5002
```

Esto te dará una salida como:
```
Forwarding    https://abc123def456.ngrok-free.app -> http://localhost:5002
```

**Copia la URL del backend** (ej: `https://abc123def456.ngrok-free.app`)

### 3. 🌐 Exponer el Frontend
En otra terminal, ejecuta:
```bash
ngrok http 3000
```

Esto te dará una salida como:
```
Forwarding    https://xyz789uvw012.ngrok-free.app -> http://localhost:3000
```

**Copia la URL del frontend** (ej: `https://xyz789uvw012.ngrok-free.app`)

### 4. ⚙️ Configurar el Frontend
Edita el archivo `vantageai-frontend/app/lib/api.js` y reemplaza:

```javascript
const backendNgrokUrl = 'https://YOUR_BACKEND_NGROK_URL.ngrok-free.app';
```

Con tu URL real del backend:
```javascript
const backendNgrokUrl = 'https://abc123def456.ngrok-free.app';
```

### 5. 🔄 Reiniciar el Frontend
```bash
# El frontend se reiniciará automáticamente con hot reload
```

### 6. ✅ Probar
- Ve a tu URL del frontend: `https://xyz789uvw012.ngrok-free.app`
- Deberías poder hacer login y usar la aplicación normalmente

## 🚨 Solución de Problemas

### Error CORS
Si sigues viendo errores CORS, verifica que:
1. El backend se reinició después de los cambios
2. La URL del backend en `api.js` es correcta
3. Estás usando HTTPS en ambas URLs

### Error de Token
Si ves "No se encontró token en localStorage":
1. Verifica que la URL del backend es correcta
2. Asegúrate de que el backend esté funcionando
3. Revisa la consola del navegador para más detalles

### URLs Dinámicas
Si necesitas cambiar las URLs frecuentemente, puedes:
1. Usar variables de entorno
2. Crear un archivo de configuración
3. Usar un proxy reverso

## 📝 Notas Importantes

- **Seguridad**: ngrok expone tu aplicación local a internet
- **Rendimiento**: Puede ser más lento que localhost
- **Sesiones**: Las sesiones pueden expirar más rápido
- **HTTPS**: ngrok usa HTTPS automáticamente

## 🔗 URLs de Ejemplo

- **Frontend**: `https://xyz789uvw012.ngrok-free.app`
- **Backend**: `https://abc123def456.ngrok-free.app`
- **API Base**: Configurada en `api.js` 