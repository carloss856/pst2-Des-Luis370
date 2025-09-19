import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use(config => {
  const publicPaths = [
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

export default api;