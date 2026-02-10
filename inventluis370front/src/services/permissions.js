import api from './api';

export const getPermissions = async () => {
  const res = await api.get('/permissions');
  return res.data;
};

export const updatePermissions = async (config) => {
  const res = await api.put('/permissions', config);
  return res.data;
};

export const resetPermissions = async () => {
  const res = await api.post('/permissions/reset');
  return res.data;
};

export const getUserPermissions = async (idPersona) => {
  const res = await api.get(`/permissions/user/${encodeURIComponent(idPersona)}`);
  return res.data;
};

export const updateUserPermissions = async (idPersona, rbac) => {
  const res = await api.put(`/permissions/user/${encodeURIComponent(idPersona)}`, rbac);
  return res.data;
};

export const resetUserPermissions = async (idPersona) => {
  const res = await api.post(`/permissions/user/${encodeURIComponent(idPersona)}/reset`);
  return res.data;
};
