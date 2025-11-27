import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {Toaster} from 'sonner';
import ProtectedRoute from '@/layouts/ProtectedRoute';
import AuthLayout from '@/layouts/AuthLayout';
import LoginView from '@/features/auth/views/LoginView';
import AdminDashboard from '@/features/admin/views/AdminDashboard';
import AdminLeadsView from '@/features/admin/views/AdminLeadsView';
import AdminQuotesView from '@/features/admin/views/AdminQuotesView';
import AgentDashboard from '@/features/agent/views/AgentDashboard';
import OwnerDashboard from '@/features/owner/views/OwnerDashboard';
import AdminUsersView from '@/features/admin/views/AdminUsersView';
import AdminPropertiesView from '@/features/admin/views/AdminPropertiesView';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route element={<AuthLayout/>}>
                    <Route path="/login" element={<LoginView/>}/>
                </Route>

                <Route element={<ProtectedRoute/>}>
                    <Route path="/admin">
                        <Route path="dashboard" element={<AdminDashboard/>}/>
                        <Route path="users/*" element={<AdminUsersView/>}/>
                        <Route path="properties" element={<AdminPropertiesView/>}/>
                        <Route path="leads" element={<AdminLeadsView/>}/>
                        <Route path="quotes" element={<AdminQuotesView/>}/>
                        <Route index element={<Navigate to="/admin/dashboard" replace/>}/>
                    </Route>
                </Route>

                <Route element={<ProtectedRoute/>}>
                    <Route path="/agent/*" element={<AgentDashboard/>}/>
                </Route>

                <Route element={<ProtectedRoute/>}>
                    <Route path="/owner/*" element={<OwnerDashboard/>}/>
                </Route>

                <Route path="/" element={<Navigate to="/admin/dashboard" replace/>}/>
            </Routes>
            <Toaster position="top-right" theme="dark"/>
        </Router>
    );
};

export default App;