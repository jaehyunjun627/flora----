import api from './index';

export const plantApi = {
  search: (params) =>
    api.get('/api/external/plants', { params }),

  getDetail: (taxonId) =>
    api.get(`/api/external/plants/${taxonId}`),

  diagnose: (data) =>
    api.post('/api/diagnosis', data),
};

export default plantApi;
