import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { VN_LOCATIONS } from "@/lib/vn-locations";

const registerSchema = z
    .object({
        fullName: z.string().min(1, "Full name is required").refine(name => name.trim().includes(' '), {
            message: "Please enter both your first and last name.",
        }),
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Invalid email address"),
        password: z.string()
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
        city: z.string().optional(),
        ward: z.string().optional(),
        zipCode: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

const SignupView: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAgent, setIsAgent] = useState(false);

    const cities = VN_LOCATIONS;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            city: "Ho Chi Minh City",
            ward: "",
            zipCode: "",
        },
    });

    const selectedCityName = watch("city");
    const selectedCity = cities.find(c => c.name === selectedCityName);
    const wards = selectedCity ? selectedCity.wards : [];

    const selectedWardName = watch("ward");
    React.useEffect(() => {
        if (selectedWardName && wards.length > 0) {
            const foundWard = wards.find(w => w.name === selectedWardName);
            if (foundWard) {
                setValue("zipCode", foundWard.zipCode);
            }
        } else {
            setValue("zipCode", "");
        }
    }, [selectedWardName, wards, setValue]);

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);

        const [firstName, ...lastNameParts] = data.fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        try {
            await authService.register({
                username: data.username,
                email: data.email,
                firstName: firstName || '',
                lastName: lastName || '',
                password: data.password,
                zipcode: isAgent ? data.zipCode : undefined,
            });

            toast.success("Account created", {
                description: "Welcome to PICMA. You can now access the full market analyzer dashboard.",
            });
            navigate("/login");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIsAgentToggle = () => {
        setIsAgent(!isAgent);
        // Clear location data when toggling off
        if (isAgent) {
            setValue("city", "Ho Chi Minh City");
            setValue("ward", "");
            setValue("zipCode", "");
        }
    };

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-50 antialiased selection:bg-primary/20 selection:text-primary">

            <div className="flex flex-1 flex-col lg:flex-row w-full">
                <div
                    className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center p-12 min-w-0">
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                    <div
                        className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-slate-900/40"></div>
                    <div className="relative z-10 max-w-lg w-full">
                        <div className="flex items-center gap-3 mb-8">
                            <span
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                <span className="material-symbols-outlined text-[20px]">psychology</span>
                            </span>
                            <span className="text-blue-400 font-semibold tracking-wide text-sm uppercase">AI-Powered Analytics</span>
                        </div>
                        <h3 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-2 tracking-tight">
                            Deep Property & <br />
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Market Analysis.</span>
                        </h3>
                        <h4 className="text-2xl text-slate-200 font-semibold mb-12">Intelligent Insights Tailored for
                            Property Owners.</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                                <span className="material-symbols-outlined text-emerald-400">verified_user</span>
                                <div>
                                    <p className="text-white font-medium text-sm">Location verification</p>
                                    <p className="text-slate-400 text-xs">Validates ward via house number & street</p>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                                <span className="material-symbols-outlined text-amber-400">flood</span>
                                <div>
                                    <p className="text-white font-medium text-sm">Risk assessment</p>
                                    <p className="text-slate-400 text-xs">Detects proximity to rivers & canals</p>
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                                <span className="material-symbols-outlined text-blue-400">request_quote</span>
                                <div>
                                    <p className="text-white font-medium text-sm">Optimal quotes</p>
                                    <p className="text-slate-400 text-xs">AI-driven valuation & insurance
                                        suggestions</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-slate-800/60 flex items-center justify-start gap-2">
                            <span className="text-slate-400 text-sm font-medium">Already have an account?</span>
                            <Link to="/signin" className="w-full sm:w-auto flex items-center justify-center rounded-lg h-11 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-semibold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] active:scale-[0.98]">
                                Log in
                            </Link>
                        </div>
                    </div>
                </div>
                <div
                    className="flex flex-1 justify-center items-start py-12 px-6 sm:px-12 bg-background-light dark:bg-background-dark overflow-y-auto min-w-0">
                    <div className="w-full max-w-[480px] flex flex-col gap-8">
                        <div className="space-y-2">
                            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Registration</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your details to create your
                                PICMA account.</p>
                        </div>
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-1.5">
                                <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                    htmlFor="full_name">Full name</label>
                                <div className="relative group">
                                    <span
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">person</span>
                                    <input
                                        {...register("fullName")}
                                        className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 pl-10 pr-3 text-sm transition-all shadow-sm"
                                        id="full_name"
                                        placeholder="e.g. Jane Doe"
                                        type="text"
                                    />
                                    {errors.fullName &&
                                        <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                    htmlFor="username">Username</label>
                                <div className="relative group">
                                    <span
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">badge</span>
                                    <input
                                        {...register("username")}
                                        className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 pl-10 pr-3 text-sm transition-all shadow-sm"
                                        id="username"
                                        placeholder="e.g. janedoe123"
                                        type="text"
                                    />
                                    {errors.username &&
                                        <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                    htmlFor="email">Email address</label>
                                <div className="relative group">
                                    <span
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">mail</span>
                                    <input
                                        {...register("email")}
                                        className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 pl-10 pr-3 text-sm transition-all shadow-sm"
                                        id="email"
                                        placeholder="name@company.com"
                                        type="email"
                                    />
                                    {errors.email &&
                                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                                </div>
                            </div>
                            <div
                                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-slate-900 dark:text-white text-sm font-semibold">Location
                                        details</h3>
                                    <button onClick={handleIsAgentToggle}
                                        className="text-primary text-xs font-medium hover:text-primary/80 transition-colors"
                                        type="button">
                                        Are you an agent?
                                    </button>
                                </div>
                                {isAgent && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                                htmlFor="city">City</label>
                                            <div className="relative">
                                                <span
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">location_city</span>
                                                <Controller
                                                    control={control}
                                                    name="city"
                                                    render={({ field }) => (
                                                        <select {...field}
                                                            className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white h-10 pl-10 pr-8 text-sm transition-all shadow-sm cursor-pointer appearance-none"
                                                            id="city">
                                                            {cities.map(c => <option key={c.name}
                                                                value={c.name}>{c.name}</option>)}
                                                        </select>
                                                    )}
                                                />
                                                <span
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-outlined text-[18px]">expand_more</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                                htmlFor="ward">Ward</label>
                                            <div className="relative">
                                                <span
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">map</span>
                                                <Controller
                                                    control={control}
                                                    name="ward"
                                                    render={({ field }) => (
                                                        <select {...field}
                                                            className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white h-10 pl-10 pr-8 text-sm transition-all shadow-sm cursor-pointer appearance-none"
                                                            id="ward">
                                                            <option disabled value="">Select a ward</option>
                                                            {wards.map(w => <option key={w.name}
                                                                value={w.name}>{w.name}</option>)}
                                                        </select>
                                                    )}
                                                />
                                                <span
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-outlined text-[18px]">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                            htmlFor="zip_code">Zip code</label>
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                                            Auto-filled
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">pin_drop</span>
                                        <input
                                            {...register("zipCode")}
                                            className="w-full rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 h-10 pl-10 pr-3 text-sm cursor-not-allowed select-none"
                                            id="zip_code"
                                            placeholder="Select Ward to generate"
                                            readOnly
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div
                                    className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                    <span
                                        className="material-symbols-outlined text-[16px] text-blue-500 shrink-0">info</span>
                                    <p>Providing a zip code registers you as an <strong
                                        className="text-slate-700 dark:text-slate-200 font-semibold">Agent</strong>.
                                        Leave Ward unselected to register as an <strong
                                            className="text-slate-700 dark:text-slate-200 font-semibold">Owner</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                        htmlFor="password">Password</label>
                                    <div className="relative group">
                                        <span
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">lock</span>
                                        <input
                                            {...register("password")}
                                            className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 pl-10 pr-3 text-sm transition-all shadow-sm"
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                    {errors.password &&
                                        <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-slate-900 dark:text-slate-200 text-sm font-medium"
                                        htmlFor="confirm_password">Confirm password</label>
                                    <div className="relative group">
                                        <span
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">lock_reset</span>
                                        <input
                                            {...register("confirmPassword")}
                                            className="w-full rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-10 pl-10 pr-3 text-sm transition-all shadow-sm"
                                            id="confirm_password"
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                    {errors.confirmPassword &&
                                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                            <button
                                className="mt-2 w-full flex items-center justify-center rounded-lg h-11 bg-primary hover:bg-blue-600 text-white text-sm font-semibold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] active:scale-[0.98]"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </button>
                            <div className="block lg:hidden text-center mt-2">
                                <span
                                    className="text-slate-500 dark:text-slate-400 text-sm">Already have an account? </span>
                                <Link to="/signin" className="text-primary font-semibold text-sm hover:underline">Log
                                    in</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupView;