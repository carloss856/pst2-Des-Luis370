import api from './api';
import { cachedGet } from '../utils/requestCache';

export const getModuleStats = async (module, { period = 'month', from, to } = {}) => {
  const params = { period };
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await api.get(`/stats/${encodeURIComponent(module)}`, { params });
  return res.data;
};

export const getModuleStatsCached = (module, { period = 'month', from, to, ttlMs = 300_000 } = {}) => {
  const key = `stats:${module}:${period}:${from || ''}:${to || ''}`;
  return cachedGet(
    key,
    () => getModuleStats(module, { period, from, to }),
    { ttlMs, backgroundRefresh: true }
  );
};

export const getStatsBatch = async ({ modules, period = 'month', from, to } = {}) => {
  const payload = { modules, period };
  if (from) payload.from = from;
  if (to) payload.to = to;
  const res = await api.post('/stats/batch', payload);
  return res.data;
};
