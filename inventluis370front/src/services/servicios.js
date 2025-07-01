import api from './api';

export const getServicios = () => api.get('/servicios').then(res => res.data);
export const getServicio = (id) => api.get(`/servicios/${id}`).then(res => res.data);
export const createServicio = (data) => api.post('/servicios', data).then(res => res.data);
export const updateServicio = (id, data) => api.put(`/servicios/${id}`, data).then(res => res.data);
export const deleteServicio = (id) => api.delete(`/servicios/${id}`).then(res => res.data);