import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);

// --- Products ---
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

// --- Deliveries ---
export const deliveryApi = {
  track: (id) => api.get(`/deliveries/${id}/track`),
  getById: (id) => api.get(`/deliveries/${id}`),
  getMyDeliveries: () => api.get('/deliveries/me'),
  getAvailableLivreurs: () => api.get('/deliveries/livreurs/available'),
  assign: (data) => api.post('/deliveries', data),
  updateStatus: (id, status, position) => api.patch(`/deliveries/${id}/status`, { status, position }),
  processPayment: (data) => api.post('/deliveries/payment', data),
  getOrderStatus: (orderId) => api.get(`/deliveries/orders/${orderId}/status`),
};

export default api;
