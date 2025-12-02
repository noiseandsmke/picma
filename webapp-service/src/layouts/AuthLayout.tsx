import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {UserRole} from '@/types/auth.types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({allowedRoles}) => {
    const {isAuthenticated, getPrimaryRole} = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const primaryRole = getPrimaryRole();
        if (!primaryRole || !allowedRoles.includes(primaryRole)) {
            if (primaryRole === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace/>;
            if (primaryRole === UserRole.AGENT) return <Navigate to="/agent/dashboard" replace/>;
            if (primaryRole === UserRole.OWNER) return <Navigate to="/owner/dashboard" replace/>;

            return <Navigate to="/login" replace/>;
        }
    }

    return <Outlet/>;
};

export default ProtectedRoute;