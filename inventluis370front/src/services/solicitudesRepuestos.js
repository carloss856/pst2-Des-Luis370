import api from "./api";

export const getSolicitudes = () => api.get("/solicitud-repuestos").then(res => res.data);
export const getSolicitud = (id) => api.get(`/solicitud-repuestos/${id}`).then(res => res.data);
export const createSolicitud = (data) => api.post("/solicitud-repuestos", data).then(res => res.data);
export const updateSolicitud = (id, data) => api.put(`/solicitud-repuestos/${id}`, data).then(res => res.data);
export const deleteSolicitud = (id) => api.delete(`/solicitud-repuestos/${id}`).then(res => res.data);