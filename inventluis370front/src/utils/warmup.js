import api from '../services/api';
import { primeCache } from './requestCache';

// Precarga de datos que suelen sentirse “pesados” al entrar a módulos.
// Se corre en background (idealmente en idle time) y queda en localStorage (TTL corto).
export const warmUpCoreData = async () => {
  const tasks = [
    primeCache('servicios:list', () => api.get('/servicios').then(r => r.data), { ttlMs: 300_000 }),
    primeCache('solicitud-repuestos:list', () => api.get('/solicitud-repuestos').then(r => r.data), { ttlMs: 300_000 }),
    primeCache('garantias:list', () => api.get('/garantias').then(r => r.data), { ttlMs: 300_000 }),

    // Dependencias comunes (para evitar “doble espera” en listas)
    primeCache('equipos:list', () => api.get('/equipos').then(r => r.data), { ttlMs: 300_000 }),
    primeCache('repuestos:list', () => api.get('/repuestos').then(r => r.data), { ttlMs: 300_000 }),
    primeCache('usuarios:list', () => api.get('/usuarios').then(r => r.data), { ttlMs: 300_000 }),
    primeCache('rma:list', () => api.get('/rma').then(r => r.data), { ttlMs: 300_000 }),
  ];

  const res = await Promise.allSettled(tasks);
  return res;
};
