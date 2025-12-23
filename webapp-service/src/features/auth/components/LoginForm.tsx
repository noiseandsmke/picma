import React, {useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {Link, useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {jwtDecode} from 'jwt-decode';

import {authService} from '@/services/authService';
import {toast} from "sonner";
import {Eye, EyeOff, Loader2, Lock, User} from 'lucide-react';

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

            const targetDashboard = getDashboardPath(roles);
            navigate(targetDashboard);

        } catch (error: any) {
            handleLoginError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDashboardPath = (roles: string[]) => {
        const upperRoles = new Set(roles.map((r: string) => r.toUpperCase()));
        if (upperRoles.has('ADMIN')) return '/admin/dashboard';
        if (upperRoles.has('AGENT')) return '/agent/dashboard';
        return '/owner/dashboard';
    };

    const handleLoginError = (error: any) => {
        console.error('Login error:', error);
        const errData = error.response?.data;
        const status = error.response?.status;

        if (errData?.error === "invalid_grant") {
            toast.error('Login Failed', {
                description: errData?.error_description === "Account disabled"
                    ? 'Your account has been disabled. Please contact support.'
                    : 'Incorrect username or password',
            });
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

        toast.error('Login Failed', {
            description: errData?.error_description || errData?.message || 'An unexpected error occurred during login.',
        });
    };

    return (
        <div className="w-full max-w-[440px] flex flex-col gap-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-text-main text-3xl font-bold tracking-tight">Log in to your account</h1>
                <p className="text-text-secondary text-sm">Enter your credentials to access the dashboard.</p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                    <label className="text-text-secondary text-xs font-semibold uppercase tracking-wide ml-1"
                           htmlFor="username">Username</label>
                    <div className="relative group">
                        <User
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors h-5 w-5"/>
                        <input
                            {...register("username")}
                            className="w-full rounded-lg bg-surface-main border border-border-main focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-muted h-11 pl-10 pr-3 text-sm transition-all shadow-sm"
                            id="username"
                            placeholder="Enter your username"
                            type="text"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-text-secondary text-xs font-semibold uppercase tracking-wide"
                               htmlFor="password">Password</label>
                    </div>
                    <div className="relative group">
                        <Lock
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors h-5 w-5"/>
                        <input
                            {...register("password")}
                            className="w-full rounded-lg bg-surface-main border border-border-main focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-muted h-11 pl-10 pr-10 text-sm transition-all shadow-sm"
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group bg-transparent border-0 outline-none"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff
                                    className="text-text-muted group-hover:text-text-main transition-colors h-5 w-5"/> :
                                <Eye className="text-text-muted group-hover:text-text-main transition-colors h-5 w-5"/>}
                        </button>
                    </div>
                </div>

                <button
                    className="mt-4 w-full flex items-center justify-center rounded-lg h-11 bg-primary hover:bg-primary-hover text-white text-sm font-semibold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Logging in...
                        </>
                    ) : 'Log in'}
                </button>

                <div className="mt-2 text-center">
                    <span className="text-text-secondary text-sm">New to PICMA? </span>
                    <Link to="/signup"
                          className="text-primary font-semibold text-sm hover:underline hover:text-primary-hover transition-colors">Create
                        an account</Link>
                </div>

            </form>
        </div>
    );
};

export default LoginForm;