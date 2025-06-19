import api from './api';

export const createEquipo = (data) => api.post('/equipos', data);
export const getEquipos = () => api.get('/equipos');
export const getEquipo = (id) => api.get(`/equipos/${id}`);
export const updateEquipo = (id, data) => api.put(`/equipos/${id}`, data);
export const deleteEquipo = (id) => api.delete(`/equipos/${id}`);