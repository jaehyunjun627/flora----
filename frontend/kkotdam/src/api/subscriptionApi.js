import axios from 'axios';

const BASE = '/api/subscriptions';

export const subscriptionApi = {
  create: (data) => axios.post(BASE, data),
  getByUser: (userId) => axios.get(`${BASE}/user/${userId}`),
  getOne: (id) => axios.get(`${BASE}/${id}`),
  cancel: (id) => axios.patch(`${BASE}/${id}/cancel`),
  pause: (id) => axios.patch(`${BASE}/${id}/pause`),
  resume: (id) => axios.patch(`${BASE}/${id}/resume`),
  addAnniversary: (subscriptionId, data) => axios.post(`${BASE}/${subscriptionId}/anniversaries`, data),
  getAnniversaries: (subscriptionId) => axios.get(`${BASE}/${subscriptionId}/anniversaries`),
  updateAnniversary: (anniversaryId, data) => axios.put(`${BASE}/anniversaries/${anniversaryId}`, data),
  deleteAnniversary: (anniversaryId) => axios.delete(`${BASE}/anniversaries/${anniversaryId}`),
};
