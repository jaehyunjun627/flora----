import api from './index';

export const memberApi = {
  getProfile: () =>
    api.get('/api/members/me'),

  updateProfile: (data) =>
    api.put('/api/members/me', data),

  getCart: () =>
    api.get('/api/cart'),

  addToCart: (data) =>
    api.post('/api/cart', data),

  updateCartItem: (itemId, data) =>
    api.put(`/api/cart/${itemId}`, data),

  deleteCartItem: (itemId) =>
    api.delete(`/api/cart/${itemId}`),
};

export default memberApi;
