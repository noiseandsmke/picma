import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoginView from '@/features/auth/views/LoginView';
import AdminDashboard from '@/features/admin/views/AdminDashboard';
import AgentDashboard from '@/features/agent/views/AgentDashboard';
import OwnerDashboard from '@/features/owner/views/OwnerDashboard';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route element={<AuthLayout/>}>
                    <Route path="/login" element={<LoginView/>}/>
                </Route>

                <Route element={<DashboardLayout/>}>
                    <Route path="/" element={<Navigate to="/admin/dashboard" replace/>}/>
                    <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
                    <Route path="/agent/dashboard" element={<AgentDashboard/>}/>
                    <Route path="/owner/dashboard" element={<OwnerDashboard/>}/>
                </Route>
            </Routes>
        </Router>
    );
};

export default App;