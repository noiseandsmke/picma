import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Eye, EyeOff, Lock, Mail, User} from 'lucide-react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import apiClient from '@/services/apiClient';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({onSuccess}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
        },
    });

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = form;

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            await apiClient.post('/auth/register', data);
            toast.success("Account created successfully. Please login.");
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || "Failed to create account. Please try again.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full h-full border-none bg-transparent shadow-none">
            <CardHeader className="space-y-1 px-0">
                <CardTitle className="text-2xl font-semibold tracking-tight text-white">Create an account</CardTitle>
                <CardDescription className="text-slate-400">Enter your details to create your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-200">First name</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('firstName')}
                            />
                            {errors.firstName && (
                                <p className="text-xs text-red-500">{errors.firstName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-200">Last name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('lastName')}
                            />
                            {errors.lastName && (
                                <p className="text-xs text-red-500">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-slate-200">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <Input
                                id="reg-email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-slate-200">Username</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <Input
                                id="reg-username"
                                type="text"
                                placeholder="username"
                                className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('username')}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-xs text-red-500">{errors.username.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-slate-200">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <Input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-9 pr-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                {...register('password')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
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

                    <Button type="submit" disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                        {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="px-0">
                <p className="text-xs text-slate-500 text-center w-full">
                    By clicking continue, you agree to our Terms of Service and Privacy Policy.
                </p>
            </CardFooter>
        </Card>
    );
};