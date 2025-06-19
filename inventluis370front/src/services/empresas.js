import api from './api';

export const createEmpresa = (data) => api.post('/empresas', data);
export const getEmpresas = () => api.get('/empresas');
export const getEmpresa = (id) => api.get(`/empresas/${id}`);
export const updateEmpresa = (id, data) => api.put(`/empresas/${id}`, data);
export const deleteEmpresa = (id) => api.delete(`/empresas/${id}`);