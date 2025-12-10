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
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    zipcode: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserDto | null;
}

export function EditUserDialog({
                                   open,
                                   onOpenChange,
                                   user,
                               }: Readonly<EditUserDialogProps>) {
    const {
        register,
        reset,
    } = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            zipcode: ""
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                zipcode: user.zipcode || "",
            });
        }
    }, [user, reset]);

    const isAgent = user?.group === 'agents' || user?.role === 'agent';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#141124] border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">View User Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                disabled
                                className="bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                disabled
                                className="bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input
                            id="email"
                            {...register("email")}
                            disabled
                            className="bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed"
                        />
                    </div>

                    {isAgent && (
                        <div className="space-y-2">
                            <Label htmlFor="zipcode" className="text-slate-300">ZipCode</Label>
                            <Input
                                id="zipcode"
                                {...register("zipcode")}
                                disabled
                                className="bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}