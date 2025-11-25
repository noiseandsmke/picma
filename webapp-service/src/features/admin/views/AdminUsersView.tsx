import React, {useState} from 'react';
import {MoreVertical, Search} from 'lucide-react';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {cn} from "@/lib/utils";
import {useQuery} from '@tanstack/react-query';
import {fetchUsers} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import AdminLayout from '../layouts/AdminLayout';

const AdminUsersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');

    const {data: users, isLoading} = useQuery({
        queryKey: ['admin-users', activeTab],
        queryFn: () => fetchUsers(activeTab)
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
                        <p className="text-slate-400">Manage internal staff, agents, and property owners.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">Add New User</Button>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <div className="flex items-center justify-between">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                                <TabsList className="bg-slate-950 border border-slate-800">
                                    <TabsTrigger value="all"
                                                 className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">All
                                        Users</TabsTrigger>
                                    <TabsTrigger value="agent"
                                                 className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Agents</TabsTrigger>
                                    <TabsTrigger value="owner"
                                                 className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Owners</TabsTrigger>
                                    <TabsTrigger value="staff"
                                                 className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Staff</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input placeholder="Search users..."
                                       className="pl-8 bg-slate-950 border-slate-800 text-slate-200"/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400">User</TableHead>
                                    <TableHead className="text-slate-400">Role</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400">Last Active</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({length: 4}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-8 w-8 rounded-full"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : users?.map((user) => (
                                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-medium border border-slate-700">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-200">{user.username}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline"
                                                   className="border-slate-700 text-slate-400 bg-slate-900">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={cn("h-2 w-2 rounded-full",
                                                    user.status === 'Active' ? "bg-emerald-500" :
                                                        user.status === 'Away' ? "bg-amber-500" : "bg-slate-500"
                                                )}/>
                                                <span className="text-slate-300">{user.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-400">{user.lastActive}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="ghost"
                                                    className="text-slate-500 hover:text-white hover:bg-slate-800">
                                                <MoreVertical className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminUsersView;