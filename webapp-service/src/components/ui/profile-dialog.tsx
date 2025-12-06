import React, {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useAuth} from '@/context/AuthContext';
import {toast} from "sonner";
import apiClient from '@/services/apiClient';

const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({open, onOpenChange}) => {
    const {user} = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: user?.email || '',
        },
        values: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
        }
    });

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            await apiClient.put(`/picma/users/${user?.id}`, {
                id: user?.id,
                username: user?.username,
                ...data,
            });

            toast.success("Profile updated successfully");
            onOpenChange(false);
        } catch (error: unknown) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#141124] border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="firstName" className="text-right text-slate-300">
                            First Name
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                            {errors.firstName && (
                                <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastName" className="text-right text-slate-300">
                            Last Name
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                            {errors.lastName && (
                                <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right text-slate-300">
                            Email
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};