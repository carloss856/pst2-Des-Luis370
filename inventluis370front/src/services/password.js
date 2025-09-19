import api from './api';

export const solicitarToken = (email) =>
  api.post('/password/forgot', { email });

export const verificarToken = (email, token) =>
  api.post('/password/verify', { email, token });

export const resetPassword = (email, token, nueva_contrasena) =>
  api.post('/password/reset', { email, token, nueva_contrasena });