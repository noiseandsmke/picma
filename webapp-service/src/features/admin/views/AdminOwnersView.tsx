import React, {useState} from 'react';
import {Mail, MoreHorizontal, Search, User} from 'lucide-react';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useQuery} from '@tanstack/react-query';
import {fetchUsers} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import AdminLayout from '../layouts/AdminLayout';

const AdminOwnersView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const {data: owners, isLoading} = useQuery({
        queryKey: ['admin-owners'],
        queryFn: () => fetchUsers('owner')
    });

    // Client-side search since endpoint doesn't support generic search yet
    const filteredOwners = owners?.filter(owner => {
        const term = searchTerm.toLowerCase();
        return (
            owner.username.toLowerCase().includes(term) ||
            owner.email.toLowerCase().includes(term) ||
            (owner.firstName && owner.firstName.toLowerCase().includes(term)) ||
            (owner.lastName && owner.lastName.toLowerCase().includes(term))
        );
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Owner Info</h2>
                        <p className="text-slate-400">Manage client profiles and contact information.</p>
                    </div>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search by Name, Email..."
                                    className="pl-8 bg-slate-950 border-slate-800 text-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400">Name</TableHead>
                                    <TableHead className="text-slate-400">Contact</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({length: 4}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-8 w-8 rounded-full"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-32"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredOwners?.map((owner) => (
                                    <TableRow key={owner.id} className="border-slate-800 hover:bg-slate-800/50 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                                                    <User className="h-4 w-4"/>
                                                </div>
                                                <div
                                                    className="font-medium text-slate-200">{owner.firstName} {owner.lastName} ({owner.username})
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Mail className="h-3 w-3"/> {owner.email}
                                                </div>
                                                {/* Phone isn't in UserDto yet, maybe extend later */}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-300 text-xs">{owner.status}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="ghost"
                                                    className="text-slate-500 hover:text-white hover:bg-slate-800">
                                                <MoreHorizontal className="h-4 w-4"/>
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

export default AdminOwnersView;