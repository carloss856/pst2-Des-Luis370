import api from "./api";
import { cachedGet } from '../utils/requestCache';

export const getRMAs = () => cachedGet('rma:list', () => api.get("/rma").then(res => res.data), { ttlMs: 300_000, backgroundRefresh: true });
export const getRMAById = (id) => api.get(`/rma/${id}`).then(res => res.data);