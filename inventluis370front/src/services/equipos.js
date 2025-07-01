import api from './api';

export const createEquipo = (data) => api.post('/equipos', data).then(res => res.data);
export const getEquipos = () => api.get('/equipos').then(res => res.data);
export const getEquipo = (id) => api.get(`/equipos/${id}`).then(res => res.data);
export const updateEquipo = (id, data) => api.put(`/equipos/${id}`, data).then(res => res.data);
export const deleteEquipo = (id) => api.delete(`/equipos/${id}`).then(res => res.data);