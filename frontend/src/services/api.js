import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inkwell_token');
  // Ensure headers object exists (some callers may pass undefined headers)
  config.headers = config.headers || {};
  if (token) {
    // Use bracket notation to avoid any potential header normalization issues
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s globally (auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('inkwell_token');
      localStorage.removeItem('inkwell_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Posts
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getOne: (id) => api.get(`/posts/${id}`),
  getFeatured: () => api.get('/posts/featured'),
  getMyPosts: (params) => api.get('/posts/my/posts', { params }),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.put(`/posts/${id}/like`),
  bookmark: (id) => api.put(`/posts/${id}/bookmark`)
};

// Comments
export const commentsAPI = {
  getByPost: (postId) => api.get(`/comments/${postId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.put(`/comments/${id}/like`)
};

// Users
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  follow: (id) => api.put(`/users/${id}/follow`),
  getDashboard: () => api.get('/users/dashboard')
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories')
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`)
};

export default api;
