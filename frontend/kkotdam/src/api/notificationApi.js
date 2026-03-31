import api from './index';

const notificationApi = {
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  getAll: () => api.get('/api/notifications'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

export default notificationApi;
