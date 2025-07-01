import api from "./api";

export const getReportes = () => api.get("/reportes").then(res => res.data);
