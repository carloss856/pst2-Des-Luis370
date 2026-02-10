import api from './api';
import { cachedGet } from '../utils/requestCache';

export const getServicios = () => cachedGet('servicios:list', () => api.get('/servicios').then(res => res.data), { ttlMs: 300_000, backgroundRefresh: true });
export const getServicio = (id) => api.get(`/servicios/${id}`).then(res => res.data);
export const createServicio = (data) => api.post('/servicios', data).then(res => res.data);
export const updateServicio = (id, data) => api.put(`/servicios/${id}`, data).then(res => res.data);
export const deleteServicio = (id) => api.delete(`/servicios/${id}`).then(res => res.data);

// Partes de trabajo (horas técnico) por servicio
export const getPartesServicio = (idServicio) =>
	api.get(`/servicios/${idServicio}/partes`).then(res => res.data);

export const addParteServicio = (idServicio, data) =>
	api.post(`/servicios/${idServicio}/partes`, data).then(res => res.data);

export const updateParteServicio = (idServicio, idParte, data) =>
	api.put(`/servicios/${idServicio}/partes/${idParte}`, data).then(res => res.data);

export const deleteParteServicio = (idServicio, idParte) =>
	api.delete(`/servicios/${idServicio}/partes/${idParte}`).then(res => res.data);