import axios from 'axios';
import { ENV } from '@/config/env';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleTokenRefresh = async (error: { config: any, response?: { status: number } }) => {

    const originalRequest = error.config;

    if (originalRequest._retry) {
        throw error;
    }

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
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
        globalThis.location.href = '/signin';
        throw error;
    }

    try {
        const { authService } = await import('./authService');
        const response = await authService.refresh(refreshToken, oldAccessToken || undefined);

        const { jwtDecode } = await import('jwt-decode');
        const decodedAccess = jwtDecode<{
            sub: string,
            preferred_username: string,
            email: string,
            realm_access?: { roles: string[] },
            zipcode?: string
        }>(response.access_token);

        let decodedId: { zipcode?: string } = {};
        if (response.id_token) {
            decodedId = jwtDecode(response.id_token);
        } else {
            const oldIdToken = sessionStorage.getItem('id_token');
            if (oldIdToken) {
                try {
                    decodedId = jwtDecode(oldIdToken);
                } catch (e) {
                    console.warn("Failed to decode old ID token", e);
                }
            }
        }

        const user = {
            id: decodedAccess.sub,
            username: decodedAccess.preferred_username,
            email: decodedAccess.email,
            roles: decodedAccess.realm_access?.roles || [],
            zipcode: decodedId.zipcode || decodedAccess.zipcode,
        };

        sessionStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('refresh_token', response.refresh_token);
        if (response.id_token) {
            sessionStorage.setItem('id_token', response.id_token);
        }
        sessionStorage.setItem('token_expires_at', String(Date.now() + response.expires_in * 1000));
        sessionStorage.setItem('user', JSON.stringify(user));

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;

        const expiresAt = Date.now() + response.expires_in * 1000;
        globalThis.dispatchEvent(new CustomEvent('auth:token-refreshed', {
            detail: { expiresAt }
        }));

        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;

        processQueue(null, response.access_token);

        return apiClient(originalRequest);
    } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.clear();
        globalThis.location.href = '/signin';
        throw refreshError;
    } finally {
        isRefreshing = false;
    }
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

        if (originalRequest.url?.includes('/auth/login')) {
            throw error;
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            return handleTokenRefresh(error);
        }

        if (error.response?.status === 401 && originalRequest._retry) {
            sessionStorage.clear();
            globalThis.location.href = '/signin';
            throw error;
        }

        if (error.response?.status === 403) {
            console.error("Access Forbidden");
        }

        throw error;
    }
);

export default apiClient;