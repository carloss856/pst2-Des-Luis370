import api from './api';

export const listTarifas = () => api.get('/tarifas-servicio').then(res => res.data);
export const getTarifa = (id) => api.get(`/tarifas-servicio/${id}`).then(res => res.data);
export const createTarifa = (data) => api.post('/tarifas-servicio', data).then(res => res.data);
export const updateTarifa = (id, data) => api.put(`/tarifas-servicio/${id}`, data).then(res => res.data);
export const deleteTarifa = (id) => api.delete(`/tarifas-servicio/${id}`).then(res => res.data);
export const getHistorialTarifa = (id) => api.get(`/tarifas-servicio/${id}/historial`).then(res => res.data);
