import React, {useState} from 'react';
import {MoreVertical, Pencil, Search, Trash} from 'lucide-react';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createUser, deleteUser, fetchUsers, UserDto} from '../services/userService';
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

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-users']});
            toast.success("User deleted successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to delete user");
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
        if (user.groupId === 'agent-group-id-placeholder') return 'Agent';
        if (user.groupId === '163e8a2c-8788-4bfc-bff8-e0d349bc9ac2') return 'Owner';
        return 'User';
    };

    const columns: Column[] = [
        {header: "User", width: "35%", className: "text-slate-400"},
        {header: "Role", width: "15%", className: "text-slate-400"},
        {header: "Status", width: "15%", className: "text-slate-400"},
        {header: "Last active", width: "20%", className: "text-slate-400"},
        {header: "Actions", width: "15%", className: "text-right text-slate-400"}
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">User management</h1>
                    </div>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Add new user
                    </Button>
                </div>

                <Card className="bg-[#141124] border-[#2e2c3a]">
                    <CardHeader className="border-b border-[#2e2c3a] pb-4">
                        <div className="flex items-center justify-between">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                                <TabsList className="bg-[#181624] border border-[#2e2c3a]">
                                    <TabsTrigger value="all"
                                                 className="data-[state=active]:bg-[#593bf2] data-[state=active]:text-white text-slate-400">All
                                        users</TabsTrigger>
                                    <TabsTrigger value="agent"
                                                 className="data-[state=active]:bg-[#593bf2] data-[state=active]:text-white text-slate-400">Agents</TabsTrigger>
                                    <TabsTrigger value="owner"
                                                 className="data-[state=active]:bg-[#593bf2] data-[state=active]:text-white text-slate-400">Owners</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search users..."
                                    className="pl-8 bg-[#181624] border-[#2e2c3a] text-slate-200 placeholder:text-slate-500 focus-visible:ring-[#593bf2]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isLoading}
                            isEmpty={!isLoading && (!filteredUsers || filteredUsers.length === 0)}
                            emptyMessage="No users found."
                        >
                            {isLoading ? (
                                Array.from({length: 4}).map((_, i) => (
                                    <TableRow key={i} className="border-[#2e2c3a]">
                                        <TableCell><Skeleton
                                            className="h-8 w-8 rounded-full bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers?.map((user) => (
                                <TableRow key={user.id}
                                          className="border-[#2e2c3a] hover:bg-[#181624]/50 group transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-9 w-9 rounded-full bg-[#593bf2]/10 flex items-center justify-center text-[#593bf2] font-medium border border-[#593bf2]/20">
                                                {user.username?.substring(0, 2).toUpperCase() || 'NA'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{user.username}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline"
                                               className="border-[#2e2c3a] text-slate-400 bg-[#181624]">
                                            {getDisplayRole(user)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("h-2 w-2 rounded-full",
                                                user.status === 'Active' ? "bg-emerald-500" :
                                                    user.status === 'Away' ? "bg-amber-500" : "bg-slate-500"
                                            )}/>
                                            <span className="text-slate-300">{user.status || 'Offline'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-400">{user.lastActive || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"
                                                        className="text-slate-500 hover:text-white hover:bg-[#593bf2]/20">
                                                    <MoreVertical className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"
                                                                 className="bg-[#1e1c2e] border-slate-800 text-slate-200">
                                                <DropdownMenuItem
                                                    className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                                    <Pencil className="mr-2 h-4 w-4"/>
                                                    Edit profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="focus:bg-red-900/20 focus:text-red-400 text-red-400 cursor-pointer"
                                                    onClick={() => user.id && deleteMutation.mutate(user.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4"/>
                                                    Delete user
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </SharedTable>
                    </CardContent>
                </Card>
            </div>

            <CreateUserDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={(data) => createMutation.mutate(data)}
                isSubmitting={createMutation.isPending}
            />
        </AdminLayout>
    );
};

export default AdminUsersView;