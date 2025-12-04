import axios from 'axios';
import {ENV} from '@/config/env';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('access_token');
        if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/refresh')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    throw err;
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = sessionStorage.getItem('refresh_token');
            const oldAccessToken = sessionStorage.getItem('access_token');

            if (!refreshToken) {
                sessionStorage.clear();
                globalThis.location.href = '/login';
                throw error;
            }

            try {
                const {authService} = await import('./authService');
                const response = await authService.refresh(refreshToken, oldAccessToken || undefined);

                const {jwtDecode} = await import('jwt-decode');
                const decoded: any = jwtDecode(response.access_token);
                const user = {
                    id: decoded.sub,
                    username: decoded.preferred_username,
                    email: decoded.email,
                    roles: decoded.realm_access?.roles || [],
                    zipcode: decoded.zipcode,
                };

                sessionStorage.setItem('access_token', response.access_token);
                sessionStorage.setItem('refresh_token', response.refresh_token);
                sessionStorage.setItem('token_expires_at', String(Date.now() + response.expires_in * 1000));
                sessionStorage.setItem('user', JSON.stringify(user));

                apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
                originalRequest.headers.Authorization = `Bearer ${response.access_token}`;

                processQueue(null, response.access_token);

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                sessionStorage.clear();
                globalThis.location.href = '/login';
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 403) {
            console.error("Access Forbidden");
        }

        throw error;
    }
);

export default apiClient;