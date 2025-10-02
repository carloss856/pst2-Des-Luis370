import api from "./api";

export const getRMAs = () => api.get("/rma").then(res => res.data);
export const getRMAById = (id) => api.get(`/rma/${id}`).then(res => res.data);