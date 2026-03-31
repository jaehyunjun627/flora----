import api from './index';

export const orderApi = {
  getAll: () =>
    api.get('/api/orders'),

  getById: (id) =>
    api.get(`/api/orders/${id}`),

  create: (data) =>
    api.post('/api/orders', data),
};

export default orderApi;
