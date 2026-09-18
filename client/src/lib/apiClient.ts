import axios from 'axios';
import { handleMockApiRequest } from './mockApi';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: handle mock auth adapter and inject access token
apiClient.interceptors.request.use(
  (config) => {
    const isMock = localStorage.getItem('isMockAuth') === 'true';

    // If running in mock/demo mode, route through in-browser mock engine
    if (isMock) {
      config.adapter = async (cfg) => {
        const mockRes = handleMockApiRequest(cfg);
        if (mockRes) {
          return {
            data: mockRes.data,
            status: mockRes.status,
            statusText: mockRes.status === 201 ? 'Created' : 'OK',
            headers: {},
            config: cfg,
          };
        }
        const defaultAdapter = axios.getAdapter(axios.defaults.adapter);
        return defaultAdapter(cfg);
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Fallback to mock API engine if backend is offline, 404, or network failed
    if (
      (!error.response || error.response.status === 404 || error.response.status >= 500) &&
      originalRequest
    ) {
      const mockRes = handleMockApiRequest(originalRequest);
      if (mockRes) {
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
