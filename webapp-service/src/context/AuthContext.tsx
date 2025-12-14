import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {toast} from "sonner";
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

    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearTokenExpiryMonitor = () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        logoutTimerRef.current = null;
        warningTimerRef.current = null;
    };

    const setupTokenExpiryMonitor = (expiresAt: number) => {
        clearTokenExpiryMonitor();

        const now = Date.now();
        const timeLeft = expiresAt - now;

        if (timeLeft <= 0) {
            logout();
            return;
        }

        const warningTime = timeLeft - (5 * 60 * 1000);
        if (warningTime > 0) {
            warningTimerRef.current = setTimeout(() => {
                toast.warning("Session Expiring Soon", {
                    description: "Your session will expire in 5 minutes. Please save your work.",
                    duration: 60000,
                    action: {
                        label: "Refresh Session",
                        onClick: () => {
                            globalThis.location.reload();
                        }
                    }
                });
            }, warningTime);
        }

        logoutTimerRef.current = setTimeout(() => {
            toast.error('Session Expired', {
                description: 'Your session has expired. You will be logged out.',
                duration: 3000
            });
            setTimeout(() => logout(), 3000);
        }, timeLeft);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        const userStr = sessionStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setAuth({isAuthenticated: true, user, token});

                const expiresAt = sessionStorage.getItem('token_expires_at');
                if (expiresAt) {
                    setupTokenExpiryMonitor(parseInt(expiresAt, 10));
                } else if (user.exp) {
                    setupTokenExpiryMonitor(user.exp * 1000);
                }
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

        const handleTokenRefreshedEvent = (event: Event) => {
            handleTokenRefresh();
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.expiresAt) {
                setupTokenExpiryMonitor(customEvent.detail.expiresAt);
            } else {
                const expiresAt = sessionStorage.getItem('token_expires_at');
                if (expiresAt) setupTokenExpiryMonitor(parseInt(expiresAt, 10));
            }
        };

        globalThis.addEventListener('auth:token-refreshed', handleTokenRefreshedEvent);
        return () => {
            globalThis.removeEventListener('auth:token-refreshed', handleTokenRefreshedEvent);
            clearTokenExpiryMonitor();
        };
    }, []);

    const login = (token: string, user: User) => {
        sessionStorage.setItem('access_token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        setAuth({isAuthenticated: true, user, token});
        if (user.exp) {
            setupTokenExpiryMonitor(user.exp * 1000);
        } else {
            const expiresAt = sessionStorage.getItem('token_expires_at');
            if (expiresAt) setupTokenExpiryMonitor(parseInt(expiresAt, 10));
        }
    };

    const logout = async () => {
        clearTokenExpiryMonitor();
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
            globalThis.location.href = '/signin';
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