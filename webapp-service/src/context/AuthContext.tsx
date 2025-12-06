import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {AuthState, User, UserRole} from '@/types/auth.types';

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
    getPrimaryRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [auth, setAuth] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });

    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        const userStr = sessionStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setAuth({isAuthenticated: true, user, token});
            } catch (e) {
                console.error("Failed to parse user from session storage", e);
                sessionStorage.clear();
            }
        }

        const handleTokenRefresh = () => {
            const newToken = sessionStorage.getItem('access_token');
            const newUserStr = sessionStorage.getItem('user');
            if (newToken && newUserStr) {
                try {
                    const newUser = JSON.parse(newUserStr);
                    setAuth({isAuthenticated: true, user: newUser, token: newToken});
                } catch (e) {
                    console.error("Failed to parse user from session storage during refresh", e);
                }
            }
        };

        globalThis.addEventListener('auth:token-refreshed', handleTokenRefresh);
        return () => {
            globalThis.removeEventListener('auth:token-refreshed', handleTokenRefresh);
        };
    }, []);

    const login = (token: string, user: User) => {
        sessionStorage.setItem('access_token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        setAuth({isAuthenticated: true, user, token});
    };

    const logout = async () => {
        const refreshToken = sessionStorage.getItem('refresh_token');

        try {
            if (refreshToken) {
                const {authService} = await import('@/services/authService');
                await authService.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            sessionStorage.clear();
            setAuth({isAuthenticated: false, user: null, token: null});
            globalThis.location.href = '/login';
        }
    };

    const hasRole = (role: UserRole): boolean => {
        if (!auth.user?.roles) return false;
        const userRoles = new Set(auth.user.roles.map(r => r.toUpperCase()));
        return userRoles.has(role);
    };

    const getPrimaryRole = (): UserRole | null => {
        if (!auth.user?.roles) return null;
        const userRoles = auth.user.roles.map(r => r.toUpperCase());
        if (userRoles.includes(UserRole.ADMIN)) return UserRole.ADMIN;
        if (userRoles.includes(UserRole.AGENT)) return UserRole.AGENT;
        if (userRoles.includes(UserRole.OWNER)) return UserRole.OWNER;

        return null;
    };

    const contextValue = useMemo(() => ({
        ...auth,
        login,
        logout,
        hasRole,
        getPrimaryRole
    }), [auth]);

    return (
        <AuthContext.Provider value={contextValue}>
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