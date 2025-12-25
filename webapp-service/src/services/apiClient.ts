import axios from 'axios';
import {ENV} from '@/config/env';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
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
        if (error.response?.status === 401) {
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