import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (email, password, role) =>
    api.post('/auth/register', { email, password, role }),
  login: (email, password, role) =>
    api.post('/auth/login', { email, password, role })
};

// Stock Services
export const stockService = {
  getAll: () => api.get('/stock'),
  add: (data) => api.post('/stock', data),
  update: (id, data) => api.put(`/stock/${id}`, data),
  delete: (id) => api.delete(`/stock/${id}`)
};

// Consumption Services
export const consumptionService = {
  log: (data) => api.post('/consume', data),
  getAll: () => api.get('/consume'),
  getMy: () => api.get('/consume/my')
};

// Order Services
export const orderService = {
  getAll: () => api.get('/orders'),
  assignVendor: (id, vendorId) => api.put(`/orders/${id}/assign`, { vendorId }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data)
};

// Shipment Services
export const shipmentService = {
  getTimeline: (orderId) => api.get(`/shipment/${orderId}`)
};

// Notification Services
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`)
};

// Audit Services
export const auditService = {
  getAll: () => api.get('/audit')
};

export default api;
