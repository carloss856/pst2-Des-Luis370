import api from './api';
import { cachedGet } from '../utils/requestCache';

export const createUsuario = (data) => api.post('/usuarios', data).then(res => res.data);
export const getUsuarios = () => cachedGet('usuarios:list', () => api.get('/usuarios').then(res => res.data), { ttlMs: 300_000, backgroundRefresh: true });
export const getUsuario = (id) => api.get(`/usuarios/${id}`).then(res => res.data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data).then(res => res.data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`).then(res => res.data);