import React, {useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {Link, useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {jwtDecode} from 'jwt-decode';

import {authService} from '@/services/authService';
import {toast} from "sonner";

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
    const {login} = useAuth();
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

            const decodedAccess = jwtDecode<any>(response.access_token);

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
            console.error('Login error:', error);
            const errData = error.response?.data;
            const status = error.response?.status;

            if (errData?.error === "invalid_grant") {
                if (errData?.error_description === "Account disabled") {
                    toast.error('Account Disabled', {
                        description: 'Your account has been disabled. Please contact support.',
                    });
                } else {
                    toast.error('Login Failed', {
                        description: 'Incorrect username or password',
                    });
                }
                return;
            }

            if (errData?.error === "unauthorized_client") {
                toast.error('Authorization Error', {
                    description: 'Client not authorized',
                });
                return;
            }

            if (status === 500) {
                toast.error('Server Error', {
                    description: 'Something went wrong on our end. Please try again later.',
                });
                return;
            }

            if (error.code === 'ERR_NETWORK') {
                toast.error('Connection Error', {
                    description: 'Unable to connect to server. Please check your internet connection.',
                });
                return;
            }

            const errorMessage = errData?.error_description || errData?.message || 'An unexpected error occurred during login.';
            toast.error('Login Failed', {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[440px] flex flex-col gap-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-white text-3xl font-bold tracking-tight">Log in to your account</h1>
                <p className="text-slate-400 text-sm">Enter your credentials to access the dashboard.</p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                    <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide ml-1"
                           htmlFor="username">Username</label>
                    <div className="relative group">
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">person</span>
                        <input
                            {...register("username")}
                            className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-3 text-sm transition-all shadow-sm"
                            id="username"
                            placeholder="Enter your username"
                            type="text"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide"
                               htmlFor="password">Password</label>
                    </div>
                    <div className="relative group">
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">lock</span>
                        <input
                            {...register("password")}
                            className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-10 text-sm transition-all shadow-sm"
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group bg-transparent border-0 outline-none"
                            onClick={() => setShowPassword(!showPassword)}>
                            <span
                                className="material-symbols-outlined text-slate-500 group-hover:text-slate-300 transition-colors text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </div>

                <button
                    className="mt-4 w-full flex items-center justify-center rounded-lg h-11 bg-primary hover:bg-primary-hover text-white text-sm font-semibold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] active:scale-[0.98]"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Log in'}
                </button>

                <div className="mt-2 text-center">
                    <span className="text-slate-400 text-sm">New to PICMA? </span>
                    <Link to="/signup"
                          className="text-primary font-semibold text-sm hover:underline hover:text-primary-hover transition-colors">Create
                        an account</Link>
                </div>

            </form>
        </div>
    );
};

export default LoginForm;