import axios from 'axios';

// Detectar automáticamente la URL base del API
const getBaseURL = () => {
  // Si estamos en el navegador
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    console.log('🔍 Detección de entorno:', { hostname, protocol, port });
    
    // Si estamos en ngrok, usar la URL del backend configurada
    if (hostname.includes('ngrok-free.app')) {
      // Para ngrok, necesitas configurar manualmente la URL del backend
      // Reemplaza esta URL con la que obtienes al ejecutar: ngrok http 5002
      const backendNgrokUrl = 'https://YOUR_BACKEND_NGROK_URL.ngrok-free.app';
      
      // Si no has configurado la URL del backend, mostrar un error
      if (backendNgrokUrl === 'https://YOUR_BACKEND_NGROK_URL.ngrok-free.app') {
        console.error('⚠️ Para usar ngrok, necesitas:');
        console.error('1. Ejecutar: ngrok http 5002');
        console.error('2. Reemplazar YOUR_BACKEND_NGROK_URL en api.js con la URL que te da ngrok');
        console.error('3. Actualizar la configuración CORS en el backend');
        return 'http://localhost:5002'; // Fallback
      }
      
      return backendNgrokUrl;
    }
    
    // Si estamos en EC2 (detectar por IP pública o dominio AWS)
    if (hostname.includes('amazonaws.com') || 
        hostname.includes('compute.amazonaws.com') ||
        hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // Usar la misma IP/hostname pero puerto 5002 para el backend
      const backendUrl = `${protocol}//${hostname}:5002`;
      console.log('🌐 EC2 detectado, usando backend URL:', backendUrl);
      return backendUrl;
    }
    
    // Si estamos en localhost, usar localhost:5002
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🏠 Localhost detectado, usando backend URL: http://localhost:5002');
      return 'http://localhost:5002';
    }
    
    // Para cualquier otro caso, usar la misma IP/hostname con puerto 5002
    const backendUrl = `${protocol}//${hostname}:5002`;
    console.log('🌍 Otro entorno detectado, usando backend URL:', backendUrl);
    return backendUrl;
  }
  
  // Por defecto, usar localhost:5002
  console.log('🔄 Usando URL por defecto: http://localhost:5002');
  return 'http://localhost:5002';
};

const baseURL = getBaseURL();
console.log('🚀 API Client configurado con baseURL:', baseURL);

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Revisa si estamos en el navegador antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token agregado al header:', config.headers['Authorization']);
      } else {
        console.log('⚠️ No se encontró token en localStorage');
      }
    }
    
    console.log('📡 Request a:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitosa:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default apiClient; 