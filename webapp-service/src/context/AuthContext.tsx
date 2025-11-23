import React, {createContext, useContext, useEffect, useState} from 'react';
import type {AuthState, User} from '@/types/auth.types';

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [auth, setAuth] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userStr = sessionStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setAuth({isAuthenticated: true, user, token});
            } catch (e) {
                console.error("Failed to parse user from session storage", e);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            }
        }
    }, []);

    const login = (token: string, user: User) => {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        setAuth({isAuthenticated: true, user, token});
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setAuth({isAuthenticated: false, user: null, token: null});
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{...auth, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};