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