import api from './index';

export const productApi = {
  getAll: (params) =>
    api.get('/api/products', { params }),

  getById: (id) =>
    api.get(`/api/products/${id}`),

  create: (data) =>
    api.post('/api/products', data),

  update: (id, data) =>
    api.put(`/api/products/${id}`, data),

  delete: (id) =>
    api.delete(`/api/products/${id}`),

  getReviews: (productId) =>
    api.get(`/api/products/${productId}/reviews`),

  createReview: (productId, data) =>
    api.post(`/api/products/${productId}/reviews`, data),
};

export default productApi;
