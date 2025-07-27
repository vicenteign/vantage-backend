import axios from 'axios';

// Configuración específica para EC2
const EC2_PUBLIC_IP = '3.141.40.201'; // Tu IP pública de EC2
const BACKEND_URL = `http://${EC2_PUBLIC_IP}:5002`;

console.log('🌐 Configuración EC2 - Backend URL:', BACKEND_URL);

const apiClient = axios.create({
  baseURL: BACKEND_URL,
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