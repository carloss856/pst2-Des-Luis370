import api from "./api";

export const getGarantias = () => api.get("/garantias").then(res => res.data);
export const getGarantia = (id) => api.get(`/garantias/${id}`).then(res => res.data);
export const updateGarantia = (id, data) => api.put(`/garantias/${id}`, data).then(res => res.data);