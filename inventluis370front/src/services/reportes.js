import api from "./api";

export const getReportes = () => api.get("/reportes").then(res => res.data);

export const createReporte = (payload) => api.post('/reportes', payload).then(res => res.data);
