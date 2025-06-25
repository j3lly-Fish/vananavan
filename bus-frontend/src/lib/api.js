import axios from 'axios';

// Determine the base URL for the backend API.
// `VITE_API_URL` can be set at build time and defaults to `/api` on the current host.
const baseURL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyToken: (token) => api.post('/auth/verify-token', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUsers: (params) => api.get('/users', { params }),
};

// Driver API
export const driverAPI = {
  getDrivers: () => api.get('/drivers'),
  getDriver: (id) => api.get(`/drivers/${id}`),
  getProfile: () => api.get('/drivers/profile'),
  updateProfile: (data) => api.put('/drivers/profile', data),
  searchDrivers: (params) => api.get('/drivers/search', { params }),
  getStats: () => api.get('/drivers/stats'),
  rateDriver: (data) => api.post('/drivers/rating', data),
};

// Route API
export const routeAPI = {
  getRoutes: () => api.get('/routes'),
  getRoute: (id) => api.get(`/routes/${id}`),
  getDriverRoutes: (driverId) => api.get(`/routes/driver/${driverId}`),
  getMyRoutes: () => api.get('/routes/my-routes'),
  createRoute: (data) => api.post('/routes', data),
  updateRoute: (id, data) => api.put(`/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/routes/${id}`),
  searchRoutes: (params) => api.get('/routes/search', { params }),
  checkAvailability: (id) => api.get(`/routes/${id}/availability`),
};

// Rider API
export const riderAPI = {
  getMyRiders: () => api.get('/riders'),
  getRider: (id) => api.get(`/riders/${id}`),
  createRider: (data) => api.post('/riders', data),
  updateRider: (id, data) => api.put(`/riders/${id}`, data),
  deleteRider: (id) => api.delete(`/riders/${id}`),
  getRidersBySchool: (school) => api.get(`/riders/school/${school}`),
  getRiderBookings: (id) => api.get(`/riders/${id}/bookings`),
};

// Booking API
export const bookingAPI = {
  getMyBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  confirmBooking: (id) => api.post(`/bookings/${id}/confirm`),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
  completeBooking: (id) => api.post(`/bookings/${id}/complete`),
  getRouteBookings: (routeId) => api.get(`/bookings/route/${routeId}`),
};

// Message API
export const messageAPI = {
  getMyMessages: () => api.get('/messages'),
  getUnreadMessages: () => api.get('/messages/unread'),
  getConversation: (userId, bookingId) => api.get(`/messages/conversation/${userId}`, {
    params: bookingId ? { booking_id: bookingId } : {}
  }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (id) => api.post(`/messages/${id}/read`),
  sendBroadcast: (data) => api.post('/messages/broadcast', data),
  getEmergencyMessages: () => api.get('/messages/emergency'),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  resetUserPassword: (id, data) => api.post(`/admin/users/${id}/password-reset`, data),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  getAllSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  systemCleanup: () => api.post('/admin/system/cleanup'),
};

export default api;

