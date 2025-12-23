import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {UserRole} from '@/types/auth.types';
import AuthLeftPanel from '../features/auth/components/AuthLeftPanel';
import '../features/auth/components/AuthLeftPanel.css';

const AuthLayout: React.FC = () => {
    const {isAuthenticated, getPrimaryRole} = useAuth();

    if (isAuthenticated) {
        const primaryRole = getPrimaryRole();
        if (primaryRole === UserRole.ADMIN) {
            return <Navigate to="/admin/dashboard" replace/>;
        }
        if (primaryRole === UserRole.AGENT) {
            return <Navigate to="/agent/dashboard" replace/>;
        }
        if (primaryRole === UserRole.OWNER) {
            return <Navigate to="/owner/dashboard" replace/>;
        }
    }

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-main font-sans text-text-main antialiased selection:bg-primary selection:text-white transition-colors duration-300">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background-main to-background-main"></div>
                <div className="absolute inset-0 bg-grid"></div>

                <div className="orbit-container orbit-1 opacity-90"
                     style={{width: '300px', height: '300px', animationDuration: '60s'}}>
                    <div className="planet-icon pos-0">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[24px] text-primary">psychology</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-180">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[24px] text-primary">insights</span>
                        </div>
                    </div>
                </div>

                <div className="orbit-container orbit-2 opacity-80"
                     style={{width: '450px', height: '450px', animationDuration: '70s'}}>
                    <div className="planet-icon pos-90">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full">
                            <span
                                className="material-symbols-outlined text-[24px] text-emerald-500">verified_user</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-270">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[24px] text-emerald-500">security</span>
                        </div>
                    </div>
                </div>

                <div className="orbit-container orbit-3 opacity-70"
                     style={{width: '650px', height: '650px', animationDuration: '90s'}}>
                    <div className="planet-icon pos-45">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-indigo-500">analytics</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-135">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-indigo-500">assessment</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-225">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-indigo-500">timeline</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-315">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-indigo-500">monitoring</span>
                        </div>
                    </div>
                </div>

                <div className="orbit-container orbit-4 opacity-60"
                     style={{width: '900px', height: '900px', animationDuration: '110s'}}>
                    <div className="planet-icon pos-0">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-amber-500">apartment</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-90">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-amber-500">domain</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-180">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full">
                            <span
                                className="material-symbols-outlined text-[22px] text-amber-500">real_estate_agent</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-270">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[22px] text-amber-500">house</span>
                        </div>
                    </div>
                </div>

                <div className="orbit-container orbit-5 opacity-50"
                     style={{width: '1200px', height: '1200px', animationDuration: '130s'}}>
                    <div className="planet-icon pos-0">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span
                                className="material-symbols-outlined text-[20px] text-rose-500">shield_with_heart</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-90">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[20px] text-rose-500">policy</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-180">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[20px] text-rose-500">request_quote</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-270">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full">
                            <span className="material-symbols-outlined text-[20px] text-rose-500">article</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row w-full z-10">
                <AuthLeftPanel/>
                <div
                    className="flex flex-1 justify-center items-center py-12 px-6 sm:px-12 bg-transparent overflow-y-auto min-w-0 relative">
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;