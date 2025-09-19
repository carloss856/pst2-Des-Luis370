import api from './api';

export const createEntrada = (data) => api.post('/inventario', data).then(res => res.data);
export const getInventario = () => api.get('/inventario').then(res => Array.isArray(res.data) ? res.data : []);
export const updateInventario = (id, data) => api.put(`/inventario/${id}`, data).then(res => res.data);
