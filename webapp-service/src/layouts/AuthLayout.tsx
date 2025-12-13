import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth.types';

const AuthLayout: React.FC = () => {
    const { isAuthenticated, getPrimaryRole } = useAuth();

    if (isAuthenticated) {
        const primaryRole = getPrimaryRole();
        if (primaryRole === UserRole.ADMIN) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (primaryRole === UserRole.AGENT) {
            return <Navigate to="/agent/dashboard" replace />;
        }
        if (primaryRole === UserRole.OWNER) {
            return <Navigate to="/owner/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default AuthLayout;