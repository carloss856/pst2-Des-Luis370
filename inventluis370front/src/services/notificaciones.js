import api from "./api";

export const getNotificaciones = () => api.get('/notificaciones').then(res => res.data);
export const getNotificacion = (id) => api.get(`/notificaciones/${id}`).then(res => res.data);

export const setNotificacionLeida = (id, leida = true) =>
	api.patch(`/notificaciones/${id}/leida`, { leida }).then(res => res.data);

export const marcarTodasLeidas = () =>
	api.post('/notificaciones/marcar-todas-leidas').then(res => res.data);