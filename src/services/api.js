import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

// Base URL without /api/v1 for health checks
const BASE_URL = API_URL.replace(/\/api\/v1\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout for Render free tier cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Server warm-up: ping health endpoint to wake Render free tier
let serverReady = false;
let warmupPromise = null;

export const warmUpServer = () => {
  if (serverReady || warmupPromise) return warmupPromise;
  warmupPromise = axios.get(`${BASE_URL}/health`, { timeout: 60000 })
    .then(() => { serverReady = true; })
    .catch(() => { /* server may still wake up on actual requests */ })
    .finally(() => { warmupPromise = null; });
  return warmupPromise;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't attach token for login or refresh-token requests
    const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh-token');
    if (!isAuthRoute) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh on login failures or if already retried
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token');
    if (isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/erp/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
