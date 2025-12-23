import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {Toaster} from 'sonner';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import {ThemeToggle} from '@/components/ThemeToggle';
import AuthLayout from '@/layouts/AuthLayout';
import SigninView from '@/features/auth/views/SigninView';
import SignupView from '@/features/auth/views/SignupView';
import AdminDashboard from '@/features/admin/views/AdminDashboard';
import AdminLeadsView from '@/features/admin/views/AdminLeadsView';
import AdminQuotesView from '@/features/admin/views/AdminQuotesView';
import AgentDashboard from '@/features/agent/views/AgentDashboard';
import OwnerDashboard from '@/features/owner/views/OwnerDashboard';
import AdminUsersView from '@/features/admin/views/AdminUsersView';
import AdminPropertiesView from '@/features/admin/views/AdminPropertiesView';
import {UserRole} from '@/types/auth.types';

const App: React.FC = () => {
    return (
        <Router>
            <div className="relative min-h-screen bg-background-main text-text-main transition-colors duration-300">
                <ThemeToggle/>
                <Routes>
                    <Route element={<AuthLayout/>}>
                        <Route path="/signin" element={<SigninView/>}/>
                        <Route path="/signup" element={<SignupView/>}/>
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}/>}>
                        <Route path="/admin">
                            <Route path="dashboard" element={<AdminDashboard/>}/>
                            <Route path="users/*" element={<AdminUsersView/>}/>
                            <Route path="properties" element={<AdminPropertiesView/>}/>
                            <Route path="leads" element={<AdminLeadsView/>}/>
                            <Route path="quotes" element={<AdminQuotesView/>}/>
                            <Route index element={<Navigate to="/admin/dashboard" replace/>}/>
                        </Route>
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.AGENT]}/>}>
                        <Route path="/agent/*" element={<AgentDashboard/>}/>
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.OWNER]}/>}>
                        <Route path="/owner/*" element={<OwnerDashboard/>}/>
                    </Route>

                    <Route path="/" element={<Navigate to="/signin" replace/>}/>
                </Routes>
                <Toaster
                    position="top-right"
                    theme="system"
                    richColors={false}
                    closeButton
                    toastOptions={{
                        duration: 4000,
                        className: 'custom-toast',
                    }}
                />
            </div>
        </Router>
    );
};

export default App;