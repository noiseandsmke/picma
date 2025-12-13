
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { jwtDecode } from 'jwt-decode';

import { authService } from '@/services/authService';
import { toast } from "sonner";
import './SigninView.css';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SigninView: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const {
        register,
        handleSubmit,
    } = form;

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await authService.login({
                username: data.username,
                password: data.password,
            });

            if (!response.access_token) {
                toast.error('Invalid response from server. Please try again.');
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decodedAccess = jwtDecode<any>(response.access_token);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let decodedId: any = {};
            if (response.id_token) {
                decodedId = jwtDecode(response.id_token);
            }

            const roles = decodedAccess.realm_access?.roles || [];

            const user = {
                id: decodedAccess.sub,
                username: decodedAccess.preferred_username,
                email: decodedAccess.email,
                roles: roles,
                zipcode: decodedId.zipcode || decodedAccess.zipcode,
                firstName: decodedId.given_name || decodedAccess.given_name,
                lastName: decodedId.family_name || decodedAccess.family_name,

                exp: decodedId.exp,
                iat: decodedId.iat,
                jti: decodedId.jti,
                iss: decodedId.iss,
                aud: decodedId.aud,
                sub: decodedId.sub,
                typ: decodedId.typ,
                azp: decodedId.azp,
                sid: decodedId.sid,
                at_hash: decodedId.at_hash,
                acr: decodedId.acr,
                email_verified: decodedId.email_verified,
                name: decodedId.name,
                preferred_username: decodedId.preferred_username,
                given_name: decodedId.given_name,
                family_name: decodedId.family_name
            };

            login(response.access_token, user);

            toast.success('Login successful', {
                description: 'Redirecting to dashboard...',
            });

            const upperRoles = new Set(roles.map((r: string) => r.toUpperCase()));
            if (upperRoles.has('ADMIN')) {
                navigate('/admin/dashboard');
            } else if (upperRoles.has('AGENT')) {
                navigate('/agent/dashboard');
            } else {
                navigate('/owner/dashboard');
            }

        } catch (error: any) {
            const errData = error.response?.data;
            if (errData?.error === "invalid_grant" && errData?.error_description === "Account disabled") {
                toast.error('Account Disabled', {
                    description: 'Your account has been disabled. Please contact support.',
                });
                return;
            }
            const errorMessage = errData?.error || errData?.message || 'Invalid username or password.';
            toast.error('Login Failed', {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="bg-bg-dark text-slate-50 font-sans min-h-screen flex flex-col relative overflow-hidden selection:bg-primary-sky selection:text-white">
            <div className="fixed inset-0 z-0 bg-bg-dark">
                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-bg-dark to-bg-dark"></div>
                <div className="absolute inset-0 bg-grid"></div>
                {/* Orbits */}
                <div className="orbit-container orbit-1">
                    <div className="planet-icon pos-0">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full" title="Property">
                            <span className="material-symbols-outlined text-[22px]">home</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-180">
                        <div className="c-rot-cw flex items-center justify-center w-full h-full" title="Analytics">
                            <span className="material-symbols-outlined text-[22px]">analytics</span>
                        </div>
                    </div>
                </div>
                <div className="orbit-container orbit-2">
                    <div className="planet-icon pos-45">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full"
                            title="Insurance Shield">
                            <span className="material-symbols-outlined text-[22px]">shield</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-225">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full"
                            title="AI Intelligence">
                            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-270">
                        <div className="c-rot-ccw flex items-center justify-center w-full h-full" title="Market Growth">
                            <span className="material-symbols-outlined text-[22px]">trending_up</span>
                        </div>
                    </div>
                </div>
                <div className="orbit-container orbit-3">
                    <div className="planet-icon pos-90">
                        <div className="c-rot-cw-slow flex items-center justify-center w-full h-full"
                            title="Commercial Property">
                            <span className="material-symbols-outlined text-[22px]">domain</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-315">
                        <div className="c-rot-cw-slow flex items-center justify-center w-full h-full" title="Policy">
                            <span className="material-symbols-outlined text-[22px]">policy</span>
                        </div>
                    </div>
                    <div className="planet-icon pos-180">
                        <div className="c-rot-cw-slow flex items-center justify-center w-full h-full"
                            title="AI Processing">
                            <span className="material-symbols-outlined text-[22px]">psychology</span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="relative z-10 flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto h-screen items-center">
                <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center mb-8">

                    <div className="text-center mt-6">
                        <h1 className="text-3xl font-bold tracking-tight text-white">PICMA</h1>
                        <p className="text-cyan-200/80 text-sm font-medium mt-2 max-w-[320px] leading-relaxed mx-auto">
                            Deep property & market analysis. Intelligent insights for owners for optimal coverage.
                        </p>
                    </div>
                </div>
                <div className="w-full sm:max-w-[440px] relative">
                    <div
                        className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
                    <div
                        className="bg-card-dark/90 backdrop-blur-xl px-6 py-10 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/50 ring-1 ring-white/5 relative">
                        <h2 className="text-xl font-bold leading-7 text-white text-center mb-1">
                            Log in to your account
                        </h2>
                        <p className="text-center text-sm text-slate-400 mb-8">
                            Enter your details to access the dashboard.
                        </p>
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-white" htmlFor="username">
                                    Username
                                </label>
                                <div className="mt-2 relative">
                                    <div
                                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span
                                            className="material-symbols-outlined text-slate-500 text-[20px]">person</span>
                                    </div>
                                    <input
                                        autoComplete="username"
                                        className="block w-full rounded-lg border-0 bg-input-dark/60 py-2.5 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-primary-sky sm:text-sm sm:leading-6 transition-all"
                                        id="username"
                                        placeholder="Enter your username"
                                        type="text"
                                        disabled={isLoading}
                                        {...register('username')}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-white" htmlFor="password">
                                    Password
                                </label>
                                <div className="mt-2 relative">
                                    <div
                                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span
                                            className="material-symbols-outlined text-slate-500 text-[20px]">lock</span>
                                    </div>
                                    <input
                                        autoComplete="current-password"
                                        className="block w-full rounded-lg border-0 bg-input-dark/60 py-2.5 pl-10 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-primary-sky sm:text-sm sm:leading-6 transition-all"
                                        id="password"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        disabled={isLoading}
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group bg-transparent border-0"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        <span
                                            className="material-symbols-outlined text-slate-500 group-hover:text-slate-300 transition-colors text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <button
                                    className="flex w-full justify-center rounded-lg bg-primary-sky px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-lg shadow-blue-500/20 hover:bg-primary-sky-hover hover:shadow-blue-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-sky transition-all duration-200"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Logging in...' : 'Log in'}
                                </button>
                            </div>
                        </form>
                        <div className="relative mt-8">
                            <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-card-dark px-3 text-slate-400 font-medium">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                type="button"
                                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:ring-white/20 transition-all duration-200"
                            >
                                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"></path>
                                </svg>
                                <span className="leading-6">Continue with Google</span>
                            </button>
                        </div>
                        <p className="mt-8 text-center text-sm text-slate-400">
                            New to PICMA?
                            <Link to="/signup"
                                className="font-semibold leading-6 text-primary-sky hover:text-primary-sky-hover hover:underline transition-colors"> Create
                                an account</Link>
                        </p>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default SigninView;