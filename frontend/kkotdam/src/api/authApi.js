import api from './index';

export const authApi = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  signup: (data) =>
    api.post('/api/auth/signup', data),

  me: () =>
    api.get('/api/auth/me'),
};

export default authApi;
