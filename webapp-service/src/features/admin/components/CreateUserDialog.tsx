import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {UserDto} from '../services/userService';

const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    mobile: z.string().min(10, "Phone number must be at least 10 digits"),
    role: z.string().min(1, "Role is required"),
});

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UserDto) => void;
    isSubmitting: boolean;
}

export function CreateUserDialog({open, onOpenChange, onSubmit, isSubmitting}: CreateUserDialogProps) {
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            mobile: "",
            role: "agent",
        },
    });

    const handleSubmit = (values: z.infer<typeof userSchema>) => {
        let groupId = "";
        if (values.role === 'agent') groupId = "agent-group-id-placeholder";
        else if (values.role === 'owner') groupId = "163e8a2c-8788-4bfc-bff8-e0d349bc9ac2";

        onSubmit({
            ...values,
            groupId: groupId
        });
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#1e1c2e] border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle>Add new user</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create a new user account. They will receive an email to verify their account.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="jdoe" {...field}
                                               className="bg-[#141124] border-slate-700 text-slate-200"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field}
                                                   className="bg-[#141124] border-slate-700 text-slate-200"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field}
                                                   className="bg-[#141124] border-slate-700 text-slate-200"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field}
                                               className="bg-[#141124] border-slate-700 text-slate-200"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="mobile"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field}
                                               className="bg-[#141124] border-slate-700 text-slate-200"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-[#141124] border-slate-700 text-slate-200">
                                                <SelectValue placeholder="Select a role"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#141124] border-slate-700 text-slate-200">
                                            <SelectItem value="agent">Agent</SelectItem>
                                            <SelectItem value="owner">Owner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                                {isSubmitting ? "Creating..." : "Create user"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}