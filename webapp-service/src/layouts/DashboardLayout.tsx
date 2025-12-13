import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const DashboardLayout: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold">Property Mgr</h1>
                    <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link to="/admin/dashboard" className="block p-2 rounded hover:bg-gray-200">Admin
                                Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/agent/dashboard" className="block p-2 rounded hover:bg-gray-200">Agent
                                Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/owner/dashboard" className="block p-2 rounded hover:bg-gray-200">Owner
                                Dashboard</Link>
                        </li>
                    </ul>
                </nav>
                <div className="p-4 border-t mt-auto">
                    <button onClick={logout}
                        className="w-full p-2 text-left text-red-600 hover:bg-red-50 rounded">Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
