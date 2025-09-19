import api from "./api";

export const getPropiedadEquipo = (id) => api.get(`/propiedadEquipo/${id}`).then(res => res.data);
export const getPropiedadEquipoByEquipo = (id_equipo) => api.get(`/propiedad-equipo/${id_equipo}`).then(res => res.data);