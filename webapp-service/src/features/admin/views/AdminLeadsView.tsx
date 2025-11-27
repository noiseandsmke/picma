import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createLead, fetchAllLeads} from '../services/leadService';
import {ArrowUpDown, Building2, Clock, PlusCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {LEAD_STATUSES, LeadStatus} from '@/types/enums';

const leadSchema = z.object({
    userInfo: z.string().min(1, 'User Info is required'),
    propertyInfo: z.string().min(1, 'Property Info is required'),
    status: z.nativeEnum(LeadStatus),
});

type LeadFormData = z.infer<typeof leadSchema>;

const AdminLeadsView: React.FC = () => {
    const queryClient = useQueryClient();
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            userInfo: '',
            propertyInfo: '',
            status: 'ACTIVE',
        },
    });

    const {
        data: leads,
        isLoading: isLeadsLoading,
        isError: isLeadsError
    } = useQuery({
        queryKey: ['admin-leads', sortConfig],
        queryFn: () => fetchAllLeads(sortConfig.key, sortConfig.direction),
    });

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-leads']});
            setIsModalOpen(false);
            reset();
        },
    });

    const onSubmit = (data: LeadFormData) => {
        createMutation.mutate(data);
    };

    const handleCreate = () => {
        reset();
        setIsModalOpen(true);
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20';
            case 'ACCEPTED':
                return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20';
            case 'EXPIRED':
                return 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Table Section */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">All Leads</h3>
                            <p className="text-sm text-slate-400">Manage and track all insurance leads.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} variant="outline"
                                    className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white">
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Create Lead
                            </Button>
                        </div>
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50 border-slate-800">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400 w-[80px] cursor-pointer"
                                               onClick={() => handleSort('id')}>
                                        <div className="flex items-center gap-1">
                                            ID {sortConfig.key === 'id' &&
                                            <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('userInfo')}>
                                        <div className="flex items-center gap-1">
                                            User Info {sortConfig.key === 'userInfo' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('propertyInfo')}>
                                        <div className="flex items-center gap-1">
                                            Property Info {sortConfig.key === 'propertyInfo' &&
                                            <ArrowUpDown size={14}/>}
                                        </div>

                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">
                                            Status {sortConfig.key === 'status' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('createDate')}>
                                        <div className="flex items-center gap-1">
                                            Created {sortConfig.key === 'createDate' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('expiryDate')}>
                                        <div className="flex items-center gap-1">
                                            Expiry {sortConfig.key === 'expiryDate' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLeadsLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isLeadsError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="h-24 text-center text-red-400">
                                            Failed to load leads data.
                                        </TableCell>
                                    </TableRow>
                                ) : leads && leads.length > 0 ? (
                                    leads.map((lead) => (
                                        <TableRow key={lead.id}
                                                  className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium text-slate-300">{lead.id}</TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#45b1fe]">{lead.userInfo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3 w-3 text-slate-500"/>
                                                    {lead.propertyInfo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline"
                                                       className={cn("border-0 font-medium", getStatusClass(lead.status))}>
                                                    {lead.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-slate-600"/>
                                                    {formatDate(lead.createDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="text-slate-400 text-sm">{formatDate(lead.expiryDate)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No active leads found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Create Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="userInfo">User Info</Label>
                                <Controller
                                    name="userInfo"
                                    control={control}
                                    render={({field}) => <Input id="userInfo" {...field}
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.userInfo &&
                                    <p className="text-red-500 text-sm">{errors.userInfo.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="propertyInfo">Property Info</Label>
                                <Controller
                                    name="propertyInfo"
                                    control={control}
                                    render={({field}) => <Input id="propertyInfo" {...field}
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.propertyInfo &&
                                    <p className="text-red-500 text-sm">{errors.propertyInfo.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({field}) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700">
                                                <SelectValue placeholder="Select status"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                {LEAD_STATUSES.map((status) => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    Create Lead
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminLeadsView;