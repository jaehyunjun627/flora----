import api from './index';

export const communityApi = {
  getPosts: (params) =>
    api.get('/api/community/posts', { params }),

  getPost: (id) =>
    api.get(`/api/community/posts/${id}`),

  createPost: (data) =>
    api.post('/api/community/posts', data),

  updatePost: (id, data) =>
    api.put(`/api/community/posts/${id}`, data),

  deletePost: (id) =>
    api.delete(`/api/community/posts/${id}`),

  getComments: (postId) =>
    api.get(`/api/community/posts/${postId}/comments`),

  createComment: (postId, data) =>
    api.post(`/api/community/posts/${postId}/comments`, data),

  deleteComment: (postId, commentId) =>
    api.delete(`/api/community/posts/${postId}/comments/${commentId}`),

  toggleLike: (postId) =>
    api.post(`/api/community/posts/${postId}/like`),
};

export default communityApi;
