import React from 'react';
import {Outlet} from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <Outlet/>
            </div>
        </div>
    );
};

export default AuthLayout;