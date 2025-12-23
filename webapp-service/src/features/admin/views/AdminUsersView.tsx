import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createUser, fetchUsers, UserDto} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import AdminLayout from '../layouts/AdminLayout';
import {CreateUserDialog} from '../components/CreateUserDialog';
import {EditUserDialog} from '../components/EditUserDialog';
import {toast} from 'sonner';
import {cn, getUserInitials} from '@/lib/utils';

const AdminUsersView: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'agent' | 'owner'>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

    const queryClient = useQueryClient();

    const {data: users, isLoading, isError} = useQuery({
        queryKey: ['admin-users', activeFilter],
        queryFn: async () => {
            const roleArg = activeFilter === 'all' ? undefined : activeFilter;
            return fetchUsers(roleArg);
        }
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


    const getRandomColor = (username: string) => {
        const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-blue-500', 'bg-purple-500'];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = (username.codePointAt(i) || 0) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleEditUser = (user: UserDto) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const getColumns = (): Column[] => {
        const actionCol = {header: "", width: "8%", className: "text-right"};

        if (activeFilter === 'agent') {
            return [
                {header: "Member", width: "40%"},
                {header: "Zipcode", width: "20%"},
                actionCol,
            ];
        }
        if (activeFilter === 'owner') {
            return [
                {header: "Member", width: "40%"},
                actionCol,
            ];
        }
        return [
            {header: "Member", width: "40%"},
            actionCol,
        ];
    };

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto pb-10">

                <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
                    <div
                        className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border-main">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeFilter === 'all' ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-main hover:bg-muted"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('agent')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeFilter === 'agent' ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-main hover:bg-muted"
                            )}
                        >
                            Agents
                        </button>
                        <button
                            onClick={() => setActiveFilter('owner')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                activeFilter === 'owner' ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-main hover:bg-muted"
                            )}
                        >
                            Owners
                        </button>
                    </div>
                </div>

                <SharedTable
                    columns={getColumns()}
                    isLoading={isLoading}
                    isEmpty={!isLoading && !isError && (!users || users.length === 0)}
                    emptyMessage="No members found matching your criteria."
                    className="border border-border-main rounded-xl overflow-hidden shadow-sm bg-surface-main"
                >
                    {isLoading ? (
                        Array.from({length: 5}).map((_, i) => (
                            <TableRow key={`user-skeleton-${i}`} className="border-b border-border-main">
                                <TableCell>
                                    <div className="flex items-center gap-3"><Skeleton
                                        className="h-10 w-10 rounded-full bg-muted"/>
                                        <div className="space-y-1"><Skeleton
                                            className="h-4 w-32 bg-muted"/><Skeleton
                                            className="h-3 w-40 bg-muted"/></div>
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-24 bg-muted"/></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full bg-muted"/></TableCell>
                                <TableCell><Skeleton className="h-4 w-24 bg-muted"/></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 ml-auto bg-muted"/></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        users?.map((user) => {


                            return (
                                <TableRow key={user.id}
                                          className="border-b border-border-main hover:bg-muted transition-colors group">
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md", getRandomColor(user.username))}>
                                                {getUserInitials(user.firstName, user.lastName)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span
                                                    className="text-text-main font-semibold">{user.firstName} {user.lastName}</span>
                                                <span className="text-text-muted text-xs">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {activeFilter === 'agent' && (
                                        <TableCell className="py-4">
                                            <span className="text-text-secondary">{user.zipcode || 'N/A'}</span>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditUser(user)}
                                            className="text-text-muted hover:text-text-main hover:bg-muted"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </SharedTable>
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