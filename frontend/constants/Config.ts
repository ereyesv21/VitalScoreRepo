// Configuración dinámica según el entorno
const getApiBaseUrl = () => {
  // Si estás en desarrollo web, usa localhost
  if (typeof window !== 'undefined') {
    return 'http://localhost:4000/api';
  }
  
  // Si estás en Expo Go, usa la IP local
  // Cambia esta IP por la de tu computadora
  return 'http://192.168.1.100:4000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Add timeout for API calls (in milliseconds)
export const API_TIMEOUT = 10000;

// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const; 