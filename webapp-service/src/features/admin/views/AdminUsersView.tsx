import React, {useState} from 'react';
import {Eye, PlusCircle} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createUser, fetchUsers, UserDto} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import AdminLayout from '../layouts/AdminLayout';
import {CreateUserDialog} from '../components/CreateUserDialog';
import {EditUserDialog} from '../components/EditUserDialog';
import {toast} from 'sonner';

const AdminUsersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

    const queryClient = useQueryClient();

    const {data: users, isLoading, isError, error} = useQuery({
        queryKey: ['admin-users', activeTab],
        queryFn: () => fetchUsers(activeTab, '')
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

    const getDisplayRole = (user: UserDto) => {
        if (user.role) return user.role;
        if (user.group === 'agents') return 'Agent';
        if (user.group === 'owners') return 'Owner';
        return 'User';
    };

    const filteredUsers = users?.filter(u => {
        const role = getDisplayRole(u).toUpperCase();
        return role !== 'ADMIN';
    });

    const getColumns = (): Column[] => {
        const baseColumns: Column[] = [
            {header: "Full Name", width: "25%", className: "text-slate-400"},
            {header: "Username", width: "20%", className: "text-slate-400"},
        ];

        if (activeTab === 'all') {
            baseColumns.push({header: "Role", width: "15%", className: "text-slate-400"});
        }

        if (activeTab === 'agent') {
            baseColumns.push({header: "ZipCode", width: "15%", className: "text-slate-400"});
        }

        baseColumns.push({header: "Email", width: "20%", className: "text-slate-400"});
        baseColumns.push({header: "Actions", width: "5%", className: "text-right text-slate-400"});

        return baseColumns;
    };

    const handleViewClick = (user: UserDto) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const renderRoleBadge = (role: string) => {
        const upperRole = role.toUpperCase();
        if (upperRole === 'OWNER') {
            return (
                <Badge variant="outline" className="border-purple-800 text-purple-200 bg-purple-900/50">
                    Owner
                </Badge>
            );
        } else if (upperRole === 'AGENT') {
            return (
                <Badge variant="outline" className="border-blue-800 text-blue-200 bg-blue-900/50">
                    Agent
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="border-slate-800 text-slate-400 bg-slate-900">
                    {role}
                </Badge>
            );
        }
    };

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
                        </div>
                    </div>

                    <div className="p-0">
                        {isError && (
                            <div className="p-6 text-center text-red-500 bg-red-500/10 border-b border-red-500/20">
                                Failed to load users: {error instanceof Error ? error.message : 'Unknown error'}
                            </div>
                        )}
                        <SharedTable
                            columns={getColumns()}
                            isLoading={isLoading}
                            isEmpty={!isLoading && !isError && (!filteredUsers || filteredUsers.length === 0)}
                            emptyMessage="No users found."
                        >
                            {isLoading ? (
                                [1, 2, 3, 4].map((id) => (
                                    <TableRow key={`skeleton-${id}`} className="border-slate-800">
                                        <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers?.map((user) => (
                                <TableRow key={user.id}
                                          className="border-slate-800 hover:bg-slate-900/50 group transition-colors">
                                    <TableCell className="font-medium text-slate-200">
                                        {user.firstName} {user.lastName}
                                    </TableCell>
                                    <TableCell className="text-slate-400">
                                        {user.username}
                                    </TableCell>
                                    {activeTab === 'all' && (
                                        <TableCell>
                                            {renderRoleBadge(getDisplayRole(user))}
                                        </TableCell>
                                    )}
                                    {activeTab === 'agent' && (
                                        <TableCell className="text-slate-400">
                                            {user.zipcode || '-'}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-slate-400">
                                        {user.email}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"
                                                        className="text-slate-500 hover:text-white hover:bg-indigo-500/20">
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"
                                                                 className="bg-slate-900 border-slate-800 text-slate-200">
                                                <DropdownMenuItem
                                                    className="focus:bg-slate-800 focus:text-white cursor-pointer"
                                                    onClick={() => handleViewClick(user)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    View user profile
                                                </DropdownMenuItem>

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

                <EditUserDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    user={selectedUser}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminUsersView;