export enum UserRole {
    ADMIN = 'ADMIN',
    AGENT = 'AGENT',
    OWNER = 'OWNER',
}

export interface User {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    roles: string[];
    zipcode?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    id_token?: string;
    not_before_policy?: number;
    session_state?: string;
    scope?: string;
}