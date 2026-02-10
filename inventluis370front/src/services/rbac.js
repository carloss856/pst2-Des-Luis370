import api from './api';

export const getMyRbac = async () => {
  const res = await api.get('/rbac');
  return res.data;
};
