import api from './api';

export const createRepuesto = (data) => api.post('/repuestos', data).then(res => res.data);
export const getRepuestos = () => api.get('/repuestos').then(res => res.data);
export const getRepuesto = (id) => api.get(`/repuestos/${id}`).then(res => res.data);
export const updateRepuesto = (id, data) => api.put(`/repuestos/${id}`, data).then(res => res.data);
export const deleteRepuesto = (id) => api.delete(`/repuestos/${id}`).then(res => res.data);
