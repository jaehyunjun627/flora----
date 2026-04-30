import api from './index';

const sellerApi = {
  // 주문 관리
  getOrders: (status) => api.get('/api/seller/orders', { params: status ? { status } : {} }),
  getOrder: (id) => api.get(`/api/seller/orders/${id}`),
  confirmOrder: (id) => api.patch(`/api/seller/orders/${id}/confirm`),
  shipOrder: (id, courierName, trackingNumber) =>
    api.patch(`/api/seller/orders/${id}/ship`, { courierName, trackingNumber }),
  deliverOrder: (id) => api.patch(`/api/seller/orders/${id}/deliver`),

  // 상품 관리
  getProducts: () => api.get('/api/seller/products'),
  updateProduct: (id, data) => api.put(`/api/seller/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/seller/products/${id}`),
  toggleProduct: (id) => api.patch(`/api/seller/products/${id}/toggle`),
};

export default sellerApi;
