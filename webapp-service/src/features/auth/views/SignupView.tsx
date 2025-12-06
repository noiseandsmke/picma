import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {authService} from "@/services/authService";
import {VN_LOCATIONS} from "@/lib/vn-locations";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const registerSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.email({message: "Invalid email address"}),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
        city: z.string().optional(),
        ward: z.string().optional(),
        zipcode: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function SignupView() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const cities = VN_LOCATIONS;
    const [selectedCityName, setSelectedCityName] = useState<string>("");

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: {errors},
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
            city: "",
            ward: "",
            zipcode: "",
        },
    });

    const selectedCity = cities.find(c => c.name === selectedCityName);
    const wards = selectedCity ? selectedCity.wards : [];

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {

            let finalZipcode = data.zipcode;

            if (data.ward) {
                const foundWard = wards.find(w => w.name === data.ward);
                if (foundWard) {
                    finalZipcode = foundWard.zipCode;
                }
            }

            await authService.register({
                username: data.username,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                password: data.password,
                zipcode: finalZipcode,
            });

            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-800 bg-[#141124] p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your details to register
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-white">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...register("firstName")}
                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-white">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...register("lastName")}
                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-white">Username</Label>
                            <Input
                                id="username"
                                {...register("username")}
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="johndoe"
                            />
                            {errors.username && (
                                <p className="text-xs text-red-500">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white">Location (For Agents)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={control}
                                    name="city"
                                    render={({field}) => (
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setSelectedCityName(val);
                                                setValue("ward", "");
                                            }}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                                <SelectValue placeholder="Select City"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0b0c15] border-slate-800 text-white">
                                                {cities.map((city) => (
                                                    <SelectItem key={city.name} value={city.name}>
                                                        {city.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="ward"
                                    render={({field}) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!selectedCityName}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                                <SelectValue placeholder="Select Ward"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0b0c15] border-slate-800 text-white h-60">
                                                {wards.map((ward) => (
                                                    <SelectItem key={ward.name} value={ward.name}>
                                                        {ward.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Sign up"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}