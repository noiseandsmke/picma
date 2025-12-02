import apiClient from './apiClient';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface UserData {
    id: string;
    username: string;
    email: string;
    name: string;
    roles: string[];
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    id_token?: string;
    user: UserData;
}

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    refresh: async (refreshToken: string, oldAccessToken?: string): Promise<LoginResponse> => {
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