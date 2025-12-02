import apiClient from './apiClient';
import type {LoginRequest, TokenResponse} from '@/types/auth.types';

export const authService = {
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    refresh: async (refreshToken: string, oldAccessToken?: string): Promise<TokenResponse> => {
        const response = await apiClient.post('/auth/refresh',
            {refresh_token: refreshToken},
            {headers: oldAccessToken ? {Authorization: `Bearer ${oldAccessToken}`} : {}}
        );
        return response.data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await apiClient.post(`/auth/logout?refresh_token=${refreshToken}`);
    }
};

export default authService;