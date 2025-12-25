import apiClient from './apiClient';
import type {LoginRequest, TokenResponse} from '@/types/auth.types';

export const authService = {
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },
    logout: async (): Promise<void> => {
        await apiClient.post(`/auth/logout`);
    },
    register: async (data: any): Promise<void> => {
        await apiClient.post('/auth/register', data);
    }
};
export default authService;