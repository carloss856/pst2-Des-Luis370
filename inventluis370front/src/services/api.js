import axios from 'axios';

// En desarrollo, si no hay VITE_API_URL, usa el proxy de Vite ("/api")
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : '/api');
const api = axios.create({ baseURL });
if (!import.meta.env.PROD) {
  // Ayuda de depuración: ver URL base efectiva en desarrollo
  // eslint-disable-next-line no-console
  console.info('[API] baseURL =', baseURL);
}

// Flags para control de renovación
let isExtending = false;
let lastExtendAt = 0;
const EXTEND_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos
const EXTEND_THROTTLE_MS = 10 * 60 * 1000; // no más de 1 vez cada 10 min

const clearSessionAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('id_usuario');
  localStorage.removeItem('nombre_usuario');
  localStorage.removeItem('rol_usuario');
  localStorage.removeItem('token_expires_at');
  if (window.location.pathname !== '/login') window.location.href = '/login';
};

api.interceptors.request.use(config => {
  const publicPaths = [
    '/register',
    '/password/forgot',
    '/password/verify',
    '/password/reset',
    '/login',
    '/forgot-password',
    '/reset-password'
  ];
  const isPublic = publicPaths.some(p => config.url?.startsWith(p));
  if (!isPublic) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de respuesta: auto-extiende token cerca de su expiración
api.interceptors.response.use(
  (response) => {
    try {
      // Evitar bucle en llamadas de extend
      if (response.config && response.config._skipExtend) return response;

      const headerVal = response.headers?.['x-token-expires-at'] || response.headers?.['X-Token-Expires-At'];
      if (headerVal) {
        localStorage.setItem('token_expires_at', headerVal);
        const expMs = Date.parse(headerVal);
        if (!Number.isNaN(expMs)) {
          const now = Date.now();
          const timeLeft = expMs - now;
          const throttled = now - lastExtendAt < EXTEND_THROTTLE_MS;
          if (timeLeft > 0 && timeLeft <= EXTEND_THRESHOLD_MS && !isExtending && !throttled) {
            isExtending = true;
            // Disparar en segundo plano, no bloquear la respuesta actual
            api.post('/token/extend', null, { _skipExtend: true })
              .then(res => {
                // Backend devuelve { message, expires_at } y ahora también header X-Token-Expires-At
                const newExpires = res?.data?.expires_at;
                if (newExpires) localStorage.setItem('token_expires_at', newExpires);
                lastExtendAt = Date.now();
              })
              .catch((err) => {
                // si falla con 401, forzar login
                if (err?.response?.status === 401) {
                  clearSessionAndRedirect();
                }
              })
              .finally(() => {
                isExtending = false;
              });
          }
        }
      }
    } catch (_) {
      // Ignorar errores del interceptor; devolver respuesta original
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearSessionAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;