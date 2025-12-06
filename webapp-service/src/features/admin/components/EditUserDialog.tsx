import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {UserDto} from "../services/userService";

const editUserSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email({message: "Invalid email"}),
    mobile: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserDto | null;
    onSubmit: (data: EditUserFormValues & { id: string }) => void;
    isSubmitting: boolean;
}

export function EditUserDialog({
                                   open,
                                   onOpenChange,
                                   user,
                                   onSubmit,
                                   isSubmitting,
                               }: Readonly<EditUserDialogProps>) {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            mobile: ""
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                mobile: user.mobile || "",
            });
        }
    }, [user, reset]);

    const onFormSubmit = (data: EditUserFormValues) => {
        if (user?.id) {
            onSubmit({...data, id: user.id});
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#141124] border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit User Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                className="bg-slate-900 border-slate-700 text-slate-200"
                            />
                            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                className="bg-slate-900 border-slate-700 text-slate-200"
                            />
                            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input
                            id="email"
                            {...register("email")}
                            className="bg-slate-900 border-slate-700 text-slate-200"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-slate-300">Mobile</Label>
                        <Input
                            id="mobile"
                            {...register("mobile")}
                            className="bg-slate-900 border-slate-700 text-slate-200"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}