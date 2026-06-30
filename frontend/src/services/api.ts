import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          sessionStorage.setItem('token', data.token);
          error.config.headers.Authorization = `Bearer ${data.token}`;
          return api(error.config);
        } catch (refreshError) {
          // Refresh failed — clear auth and redirect
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 503 && error.response.data?.maintenanceMode) {
      // System is in maintenance mode — kick out non-admin users
      try {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user || user.role !== 'Admin') {
          // Force logout: clear session and redirect to login with maintenance flag
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          window.location.href = '/login?maintenance=true';
        }
        // Admins: don't redirect, just let the error propagate normally
      } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        window.location.href = '/login?maintenance=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
