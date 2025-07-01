import api from './api';

export const createEmpresa = (data) => api.post('/empresas', data).then(res => res.data);
export const getEmpresas = () => api.get('/empresas').then(res => res.data);
export const getEmpresa = (id) => api.get(`/empresas/${id}`).then(res => res.data);
export const updateEmpresa = (id, data) => api.put(`/empresas/${id}`, data).then(res => res.data);
export const deleteEmpresa = (id) => api.delete(`/empresas/${id}`).then(res => res.data);