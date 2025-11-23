import React from 'react';
import {Outlet} from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-lg">
                <Outlet/>
            </div>
        </div>
    );
};

export default AuthLayout;