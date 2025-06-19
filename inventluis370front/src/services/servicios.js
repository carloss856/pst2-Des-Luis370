import api from './api';

export const getServicios = () => api.get('/servicios');
export const getServicio = (id) => api.get(`/servicios/${id}`);
export const createServicio = (data) => api.post('/servicios', data);
export const updateServicio = (id, data) => api.put(`/servicios/${id}`, data);
export const deleteServicio = (id) => api.delete(`/servicios/${id}`);