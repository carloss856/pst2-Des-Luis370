import api from './api';

export const createUsuario = (data) => api.post('/usuarios', data).then(res => res.data);
export const getUsuarios = () => api.get('/usuarios').then(res => res.data);
export const getUsuario = (id) => api.get(`/usuarios/${id}`).then(res => res.data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data).then(res => res.data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`).then(res => res.data);