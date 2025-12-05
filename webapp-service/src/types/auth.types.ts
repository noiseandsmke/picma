export interface LoginRequest {
    username?: string;
    password?: string;
}

export interface RegisterRequest {
    username: string;
    password?: string;
    email: string;
    firstName: string;
    lastName: string;
    zipcode?: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    id_token?: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    is_admin?: boolean;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    AGENT = 'AGENT',
    OWNER = 'OWNER'
}

export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    zipcode?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}