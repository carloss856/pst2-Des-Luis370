import api from "./api";
import { cachedGet } from '../utils/requestCache';

export const getGarantias = () => cachedGet('garantias:list', () => api.get("/garantias").then(res => res.data), { ttlMs: 300_000, backgroundRefresh: true });
export const getGarantia = (id) => api.get(`/garantias/${id}`).then(res => res.data);
export const updateGarantia = (id, data) => api.put(`/garantias/${id}`, data).then(res => res.data);
export const deleteGarantia = (id) => api.delete(`/garantias/${id}`).then(res => res.data);