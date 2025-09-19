import api from "./api";

export const getRMAs = () => api.get("/rmas").then(res => res.data);
export const getRMAById = (id) => api.get(`/rmas/${id}`).then(res => res.data);