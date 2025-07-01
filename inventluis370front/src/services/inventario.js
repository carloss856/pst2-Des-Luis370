import api from './api';

export const getInventario = () => api.get('/inventario').then(res => Array.isArray(res.data) ? res.data : []);
