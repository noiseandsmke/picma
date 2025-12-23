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
            <DialogContent className="sm:max-w-[425px] bg-surface-main border-border-main text-text-main">
                <DialogHeader>
                    <DialogTitle className="text-text-main">View user profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-text-secondary">First name</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                disabled
                                className="bg-input-bg border-input-border text-text-muted cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-text-secondary">Last name</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                disabled
                                className="bg-input-bg border-input-border text-text-muted cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-text-secondary">Email</Label>
                        <Input
                            id="email"
                            {...register("email")}
                            disabled
                            className="bg-input-bg border-input-border text-text-muted cursor-not-allowed"
                        />
                    </div>

                    {isAgent && (
                        <div className="space-y-2">
                            <Label htmlFor="zipcode" className="text-text-secondary">Zip code</Label>
                            <Input
                                id="zipcode"
                                {...register("zipcode")}
                                disabled
                                className="bg-input-bg border-input-border text-text-muted cursor-not-allowed"
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-input-border text-text-secondary hover:bg-muted hover:text-text-main"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}