import axios from 'axios';
import { handleMockApiRequest } from './mockApi';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Detect whether running in standalone demo mode or on Vercel without a dedicated backend
export const isClientOnlyEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('isMockAuth') === 'true') return true;
  // If hosted on Vercel (e.g. multi-school-erp-pi.vercel.app) without a separate backend API URL
  if (window.location.hostname.includes('vercel.app') && !import.meta.env.VITE_API_URL) return true;
  return false;
};

// Request interceptor: route directly to mock engine if client-only/mock mode
apiClient.interceptors.request.use(
  (config) => {
    if (isClientOnlyEnvironment()) {
      config.adapter = async (cfg) => {
        const mockRes = handleMockApiRequest(cfg);
        return {
          data: mockRes.data,
          status: mockRes.status,
          statusText: mockRes.status === 201 ? 'Created' : 'OK',
          headers: {},
          config: cfg,
        };
      };
    }

    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle automatic refresh token rotation & offline mock fallback
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // If Vercel static rewrites returned index.html string for a GET /api/v1/* request
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html') || response.data.includes('<!DOCTYPE html'))
    ) {
      const mockRes = handleMockApiRequest(response.config);
      if (mockRes) {
        localStorage.setItem('isMockAuth', 'true');
        return {
          ...response,
          data: mockRes.data,
          status: mockRes.status,
        };
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Fallback to mock API engine if backend returned 405 (Method Not Allowed on Vercel), 404, 5xx, or network error
    if (
      (!error.response ||
        error.response.status === 405 ||
        error.response.status === 404 ||
        error.response.status === 403 ||
        error.response.status >= 500 ||
        error.code === 'ERR_NETWORK') &&
      originalRequest
    ) {
      const mockRes = handleMockApiRequest(originalRequest);
      if (mockRes) {
        localStorage.setItem('isMockAuth', 'true');
        return Promise.resolve({
          data: mockRes.data,
          status: mockRes.status,
          statusText: mockRes.status === 201 ? 'Created' : 'OK',
          headers: {},
          config: originalRequest,
        });
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
