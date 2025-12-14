import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {toast} from "sonner";
import {authService} from "@/services/authService";
import {VN_LOCATIONS} from "@/lib/vn-locations";
import {SearchableSelect} from '@/components/ui/searchable-select';
import {Eye, EyeOff} from "lucide-react";

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

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAgent, setIsAgent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const cities = VN_LOCATIONS;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: {errors},
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

    const wardOptions = wards.map(w => ({
        value: w.name,
        label: w.name,
    }));

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
            navigate("/signin");
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
        if (isAgent) {
            setValue("city", "Ho Chi Minh City");
            setValue("ward", "");
            setValue("zipCode", "");
        }
    };

    return (
        <div className="w-full max-w-[440px] flex flex-col gap-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-white text-3xl font-bold tracking-tight">Create an account</h1>
                <p className="text-slate-400 text-sm">Enter your details to get started with PICMA.</p>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                    <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide ml-1"
                           htmlFor="full_name">Full Name</label>
                    <div className="relative group">
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">person</span>
                        <input
                            {...register("fullName")}
                            className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-3 text-sm transition-all shadow-sm"
                            id="full_name"
                            placeholder="e.g. Jane Doe"
                            type="text"

                        />
                        {errors.fullName && <p className="text-xs text-red-500 mt-1 ml-1">{errors.fullName.message}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide ml-1"
                           htmlFor="username">Username</label>
                    <div className="relative group">
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">badge</span>
                        <input
                            {...register("username")}
                            className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-3 text-sm transition-all shadow-sm"
                            id="username"
                            placeholder="e.g. janedoe123"
                            type="text"
                        />
                        {errors.username && <p className="text-xs text-red-500 mt-1 ml-1">{errors.username.message}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide ml-1"
                           htmlFor="email">Email Address</label>
                    <div className="relative group">
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">mail</span>
                        <input
                            {...register("email")}
                            className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-3 text-sm transition-all shadow-sm"
                            id="email"
                            placeholder="name@company.com"
                            type="email"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                            Location Details
                        </h3>
                        <button onClick={handleIsAgentToggle}
                                className="text-primary text-xs font-semibold hover:text-primary-hover transition-colors underline-offset-4 hover:underline"
                                type="button">
                            {isAgent ? "Switch to Owner" : "Are you an Agent?"}
                        </button>
                    </div>

                    {isAgent && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up-fade relative z-20">
                            <div className="hidden">
                                <input type="hidden" {...register("city")} value="Ho Chi Minh City"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-400 text-xs font-medium ml-1" htmlFor="ward">Ward</label>
                                <div className="relative group z-20">
                                    <span
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">map</span>
                                    <Controller
                                        control={control}
                                        name="ward"
                                        render={({field}) => (
                                            <SearchableSelect
                                                options={wardOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select ward"
                                                disabled={wards.length === 0}
                                                className="w-full bg-surface-dark"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-slate-400 text-xs font-medium" htmlFor="zip_code">Zip Code</label>
                            <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${watch('zipCode') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                {watch('zipCode') ? 'Auto-filled' : 'Generated'}
                            </span>
                        </div>
                        <div className="relative">
                            <span
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 material-symbols-outlined text-[20px]">pin_drop</span>
                            <input
                                {...register("zipCode")}
                                className="w-full rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-500 h-10 pl-10 pr-3 text-sm cursor-not-allowed select-none font-mono"
                                id="zip_code"
                                placeholder="--"
                                readOnly
                                type="text"
                            />
                        </div>
                    </div>
                    <div
                        className="flex gap-3 text-xs text-slate-400 leading-relaxed bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                        <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0">info</span>
                        <p>Providing a zip code registers you as an <strong
                            className="text-blue-400 font-medium">Agent</strong>.
                            Leave Ward unselected to register as an <strong
                                className="text-blue-400 font-medium">Owner</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide ml-1"
                               htmlFor="password">Password</label>
                        <div className="relative group">
                            <span
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">lock</span>
                            <input
                                {...register("password")}
                                className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-10 text-sm transition-all shadow-sm"
                                id="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-slate-300 text-xs font-semibold uppercase tracking-wide ml-1"
                               htmlFor="confirm_password">Confirm</label>
                        <div className="relative group">
                            <span
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors material-symbols-outlined text-[20px]">lock_reset</span>
                            <input
                                {...register("confirmPassword")}
                                className="w-full rounded-lg bg-surface-dark border border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-200 placeholder:text-slate-600 h-11 pl-10 pr-3 text-sm transition-all shadow-sm"
                                id="confirm_password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                            />
                        </div>
                        {errors.confirmPassword &&
                            <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <button
                    className="mt-4 w-full flex items-center justify-center rounded-lg h-11 bg-primary hover:bg-primary-hover text-white text-sm font-semibold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] active:scale-[0.98]"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="mt-6 text-center">
                    <span className="text-slate-400 text-sm">Already have an account? </span>
                    <Link to="/signin"
                          className="text-primary font-semibold text-sm hover:underline hover:text-primary-hover transition-colors">Log
                        in</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;