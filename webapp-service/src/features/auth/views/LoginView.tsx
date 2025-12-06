import React, {useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {AlertCircle, Command, Eye, EyeOff, Lock, User} from 'lucide-react';
import {toast} from 'sonner';
import {authService} from '@/services/authService';
import {jwtDecode} from 'jwt-decode';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginView: React.FC = () => {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false,
        },
    });

    const {
        register,
        handleSubmit,
        control,
        formState: {errors},
    } = form;

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const response = await authService.login({
                username: data.username,
                password: data.password,
            });

            if (!response.access_token) {
                setErrorMsg('Invalid response from server. Please try again.');
                return;
            }

            const decodedAccess: any = jwtDecode(response.access_token);
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
            };

            sessionStorage.setItem('access_token', response.access_token);
            sessionStorage.setItem('refresh_token', response.refresh_token);
            if (response.id_token) {
                sessionStorage.setItem('id_token', response.id_token);
            }
            sessionStorage.setItem('token_expires_at', String(Date.now() + response.expires_in * 1000));
            sessionStorage.setItem('user', JSON.stringify(user));

            login(response.access_token, user);
            toast.success('Logged in successfully');

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
                setErrorMsg("Your account has been disabled. Please contact support.");
                return;
            }

            const errorMessage = errData?.error || errData?.message || 'Invalid username or password.';
            setErrorMsg(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card className="w-full border-[#2e2c3a] bg-[#141124] text-slate-50 shadow-xl ring-1 ring-[#2e2c3a]">
            <CardHeader className="space-y-4 text-center">
                <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-500">
                    <Command className="h-6 w-6"/>
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">Sign in to your account</CardTitle>
                    <CardDescription className="text-slate-400">Enter your details to login</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="outline"
                        className="w-full bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-slate-50 text-slate-200">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span className="sr-only">Sign in with Google</span>
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700"/>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#141124] px-2 text-slate-400">Or</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {errorMsg && (
                        <Alert variant="destructive" className="bg-red-900/10 border-red-900/20 text-red-500">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {errorMsg}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-200">Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <Input
                                id="username"
                                type="text"
                                placeholder="username"
                                disabled={isLoading}
                                className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('username')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-xs text-red-500">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="pl-9 pr-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('password')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit(onSubmit)();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={isLoading}
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-slate-300 text-slate-400"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" aria-hidden="true"/>
                                ) : (
                                    <Eye className="h-4 w-4" aria-hidden="true"/>
                                )}
                                <span className="sr-only">
                                    {showPassword ? 'Hide password' : 'Show password'}
                                </span>
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Controller
                                control={control}
                                name="rememberMe"
                                render={({field}) => (
                                    <Checkbox
                                        id="rememberMe"
                                        checked={field.value}
                                        disabled={isLoading}
                                        onCheckedChange={field.onChange}
                                        className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                    />
                                )}
                            />
                            <Label htmlFor="rememberMe"
                                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300">
                                Keep me logged in
                            </Label>
                        </div>
                        <Button variant="link" className="px-0 font-normal text-slate-300 hover:text-indigo-400 h-auto"
                                disabled={isLoading}
                                onClick={(e) => {
                                    e.preventDefault();
                                }}>
                            Forgot password?
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <div className="text-sm text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Button variant="link" className="p-0 text-indigo-400 hover:text-indigo-300 h-auto font-normal"
                            disabled={isLoading}
                            onClick={() => navigate('/signup')}>
                        Signup
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default LoginView;