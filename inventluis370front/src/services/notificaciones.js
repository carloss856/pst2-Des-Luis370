import api from "./api";

export const getNotificaciones = () => api.get('/notificaciones').then(res => res.data);
export const getNotificacion = (id) => api.get(`/notificaciones/${id}`).then(res => res.data);