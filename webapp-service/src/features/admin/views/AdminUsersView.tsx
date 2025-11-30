import React, {useState} from 'react';
import {ArrowLeftRight, MoreVertical, Pencil, PlusCircle, Power, Search} from 'lucide-react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createUser, fetchUsers, switchUserGroup, updateUserStatus, UserDto} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import AdminLayout from '../layouts/AdminLayout';
import {CreateUserDialog} from '../components/CreateUserDialog';
import {toast} from 'sonner';

const AdminUsersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const queryClient = useQueryClient();

    const {data: users, isLoading} = useQuery({
        queryKey: ['admin-users', activeTab],
        queryFn: () => fetchUsers(activeTab)
    });

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-users']});
            setIsCreateOpen(false);
            toast.success("User created successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create user");
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({userId}: { userId: string }) =>
            updateUserStatus(userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-users']});
            toast.success(`User status updated successfully`);
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to update user status");
        }
    });

    const switchGroupMutation = useMutation({
        mutationFn: ({userId}: { userId: string }) =>
            switchUserGroup(userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-users']});
            toast.success("User group switched successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to switch user group");
        }
    });

    const filteredUsers = users?.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.firstName && user.firstName.toLowerCase().includes(term)) ||
            (user.lastName && user.lastName.toLowerCase().includes(term))
        );
    });

    const getDisplayRole = (user: UserDto) => {
        if (user.role) return user.role;

        if (user.group === 'agents') return 'Agent';
        if (user.group === 'owners') return 'Owner';
        return 'User';
    };

    const columns: Column[] = [
        {header: "User", width: activeTab === 'all' ? "35%" : "50%", className: "text-slate-400"},
        ...(activeTab === 'all' ? [{header: "Role", width: "15%", className: "text-slate-400"}] : []),
        {header: "Status", width: "15%", className: "text-slate-400"},
        {header: "Last active", width: "20%", className: "text-slate-400"},
        {header: "Actions", width: "15%", className: "text-right text-slate-400"}
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex flex-col space-y-4 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <h3 className="font-semibold text-lg text-white">All Users</h3>
                                <p className="text-sm text-slate-400">Manage and track system users.</p>
                            </div>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                variant="outline"
                                className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white"
                            >
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Create User
                            </Button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                <TabsList className="bg-slate-900 border border-slate-800">
                                    <TabsTrigger
                                        value="all"
                                        className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-slate-400"
                                    >
                                        All Users
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="agent"
                                        className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-slate-400"
                                    >
                                        Agents
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="owner"
                                        className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-slate-400"
                                    >
                                        Owners
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative flex-1 max-w-sm w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9 bg-slate-900 border-slate-700 focus-visible:ring-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isLoading}
                            isEmpty={!isLoading && (!filteredUsers || filteredUsers.length === 0)}
                            emptyMessage="No users found."
                        >
                            {isLoading ? (
                                Array.from({length: 4}).map((_, i) => (
                                    <TableRow key={i} className="border-slate-800">
                                        <TableCell><Skeleton
                                            className="h-8 w-8 rounded-full bg-slate-800"/></TableCell>
                                        {activeTab === 'all' && (
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        )}
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers?.map((user) => (
                                <TableRow key={user.id}
                                          className="border-slate-800 hover:bg-slate-900/50 group transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-medium border border-indigo-500/20">
                                                {user.username?.substring(0, 2).toUpperCase() || 'NA'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{user.username}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {activeTab === 'all' && (
                                        <TableCell>
                                            <Badge variant="outline"
                                                   className="border-slate-800 text-slate-400 bg-slate-900">
                                                {getDisplayRole(user)}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("h-2 w-2 rounded-full",
                                                user.enabled ? "bg-emerald-500" : "bg-red-500"
                                            )}/>
                                            <span className="text-slate-300">
                                                {user.enabled ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-400">{user.lastActive || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"
                                                        className="text-slate-500 hover:text-white hover:bg-indigo-500/20">
                                                    <MoreVertical className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"
                                                                 className="bg-slate-900 border-slate-800 text-slate-200">
                                                <DropdownMenuItem
                                                    className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4"/>
                                                    Edit profile
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="bg-slate-800"/>

                                                <DropdownMenuItem
                                                    className={cn("focus:bg-slate-800 cursor-pointer",
                                                        user.enabled ? "text-red-400 focus:text-red-400" : "text-emerald-400 focus:text-emerald-400"
                                                    )}
                                                    onClick={() => user.id && statusMutation.mutate({
                                                        userId: user.id
                                                    })}
                                                >
                                                    <Power className="mr-2 h-4 w-4"/>
                                                    {user.enabled ? "Disable Account" : "Enable Account"}
                                                </DropdownMenuItem>

                                                {(user.group === 'agents' || user.group === 'owners') && (
                                                    <DropdownMenuItem
                                                        className="focus:bg-slate-800 focus:text-white cursor-pointer text-amber-500"
                                                        onClick={() => user.id && switchGroupMutation.mutate({
                                                            userId: user.id
                                                        })}
                                                    >
                                                        <ArrowLeftRight className="mr-2 h-4 w-4"/>
                                                        {user.group === 'agents' ? "Switch to Owner" : "Switch to Agent"}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </SharedTable>
                    </div>
                </div>

                <CreateUserDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    onSubmit={(data) => createMutation.mutate(data)}
                    isSubmitting={createMutation.isPending}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminUsersView;