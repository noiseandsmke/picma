import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createLead, deleteLead, fetchAllLeads} from '../services/leadService';
import {fetchAllProperties} from '../services/propertyService';
import {ArrowUpDown, Building2, Clock, Eye, MoreHorizontal, PlusCircle, Search, Trash2, User} from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Detailed form schema for UI
const createLeadSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    phoneNumber: z.string().min(1, 'Phone Number is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    cost: z.string().min(1, 'Cost is required'),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;


const AdminLeadsView: React.FC = () => {
    const queryClient = useQueryClient();
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const {
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<CreateLeadFormData>({
        resolver: zodResolver(createLeadSchema),
        defaultValues: {
            fullName: '',
            phoneNumber: '',
            email: '',
            address: '',
            city: '',
            cost: '',
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

    const {data: properties} = useQuery({
        queryKey: ['admin-properties'],
        queryFn: fetchAllProperties,
    });

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-leads']});
            setIsModalOpen(false);
            reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-leads']});
        }
    });

    const onSubmit = (data: CreateLeadFormData) => {
        // Concatenate User Info
        const userInfo = `${data.fullName} - ${data.phoneNumber} - ${data.email}`;

        // Package Property Info as JSON
        const propertyInfo = JSON.stringify({
            address: data.address,
            city: data.city,
            cost: data.cost
        });

        const payload = {
            userInfo,
            propertyInfo,
            status: 'ACTIVE'
        };

        createMutation.mutate(payload);
    };

    const handleCreate = () => {
        reset();
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            deleteMutation.mutate(id);
        }
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
            case 'IN_REVIEWING':
                return 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20';
            case 'ACCEPTED':
                return 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'; // Or grey as requested, but red is clearer for rejected
            case 'EXPIRED':
                return 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400';
        }
    };

    // Helper to parse User Info
    const parseUserInfo = (userInfo: string) => {
        if (!userInfo) return {name: 'Unknown', details: ''};

        // Try splitting by hyphen if it follows the format "Name - Phone - Email"
        const parts = userInfo.split(' - ');
        if (parts.length >= 2) {
            return {
                name: parts[0],
                details: parts.slice(1).join(' • ')
            };
        }

        // Fallback
        return {name: userInfo, details: ''};
    };

    // Helper to resolve Property Info
    const resolvePropertyInfo = (propertyInfoStr: string) => {
        // 1. Try to see if it's a JSON string (from new Create Lead)
        try {
            const obj = JSON.parse(propertyInfoStr);
            if (obj && obj.address) {
                return `${obj.address}, ${obj.city}`;
            }
        } catch (e) {
            // Not JSON, continue
        }

        // 2. Try to match with fetched properties (if it's an ID)
        if (properties && properties.length > 0) {
            const matchedProp = properties.find(p => String(p.id) === String(propertyInfoStr));
            if (matchedProp) {
                return `${matchedProp.location.fullAddress} (${matchedProp.attributes.occupancyType})`;
            }
        }

        // 3. Fallback to raw string
        return propertyInfoStr;
    };

    const filteredLeads = leads?.filter(lead => {
        const matchesSearch =
            lead.userInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(lead.id).includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Table Section */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex flex-col space-y-4 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <h3 className="font-semibold text-lg text-white">All Leads</h3>
                                <p className="text-sm text-slate-400">Manage and track all insurance leads.</p>
                            </div>
                            <Button onClick={handleCreate} variant="outline"
                                    className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white">
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Create Lead
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    type="text"
                                    placeholder="Search by name, phone or ID..."
                                    className="pl-9 bg-slate-900 border-slate-700 focus-visible:ring-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
                                    <SelectValue placeholder="Filter by status"/>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="IN_REVIEWING">In Reviewing</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    <TableHead className="text-slate-400">Actions</TableHead>
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
                                            <TableCell><Skeleton className="h-8 w-8 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isLeadsError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="h-24 text-center text-red-400">
                                            Failed to load leads data.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLeads && filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead) => {
                                        const {name, details} = parseUserInfo(lead.userInfo);
                                        const displayProperty = resolvePropertyInfo(lead.propertyInfo);

                                        return (
                                            <TableRow key={lead.id}
                                                      className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                                <TableCell className="font-medium text-slate-300">{lead.id}</TableCell>
                                                <TableCell className="text-slate-300">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                            <User size={14}/>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-200">{name}</span>
                                                            <span className="text-xs text-slate-500">{details}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-3 w-3 text-slate-500"/>
                                                        <span className="truncate max-w-[200px]"
                                                              title={displayProperty}>
                                                            {displayProperty}
                                                        </span>
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
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost"
                                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4"/>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end"
                                                                             className="bg-slate-900 border-slate-800 text-slate-200">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4"/>
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-800"/>
                                                            <DropdownMenuItem
                                                                className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer"
                                                                onClick={() => handleDelete(lead.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Delete Lead
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No leads found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">

                            {/* User Info Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">User
                                    Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                                        <Controller
                                            name="fullName"
                                            control={control}
                                            render={({field}) => <Input id="fullName"
                                                                        placeholder="Nguyen Van A" {...field}
                                                                        className="bg-slate-900 border-slate-700 mt-1.5"/>}
                                        />
                                        {errors.fullName &&
                                            <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="phoneNumber" className="text-slate-300">Phone Number</Label>
                                        <Controller
                                            name="phoneNumber"
                                            control={control}
                                            render={({field}) => <Input id="phoneNumber"
                                                                        placeholder="0901234567" {...field}
                                                                        className="bg-slate-900 border-slate-700 mt-1.5"/>}
                                        />
                                        {errors.phoneNumber &&
                                            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({field}) => <Input id="email" type="email"
                                                                        placeholder="example@email.com" {...field}
                                                                        className="bg-slate-900 border-slate-700 mt-1.5"/>}
                                        />
                                        {errors.email &&
                                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-800"/>

                            {/* Property Info Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Property
                                    Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="address" className="text-slate-300">Property Address</Label>
                                        <Controller
                                            name="address"
                                            control={control}
                                            render={({field}) => <Input id="address"
                                                                        placeholder="123 Street Name" {...field}
                                                                        className="bg-slate-900 border-slate-700 mt-1.5"/>}
                                        />
                                        {errors.address &&
                                            <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="city" className="text-slate-300">City / Province</Label>
                                        <Controller
                                            name="city"
                                            control={control}
                                            render={({field}) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="bg-slate-900 border-slate-700 mt-1.5">
                                                        <SelectValue placeholder="Select city"/>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                        <SelectItem value="Ho Chi Minh">Ho Chi Minh</SelectItem>
                                                        <SelectItem value="Ha Noi">Ha Noi</SelectItem>
                                                        <SelectItem value="Da Nang">Da Nang</SelectItem>
                                                        <SelectItem value="Others">Others</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.city &&
                                            <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="cost" className="text-slate-300">Estimated Cost ($)</Label>
                                        <Controller
                                            name="cost"
                                            control={control}
                                            render={({field}) => <Input id="cost" type="number"
                                                                        placeholder="500000" {...field}
                                                                        className="bg-slate-900 border-slate-700 mt-1.5"/>}
                                        />
                                        {errors.cost &&
                                            <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={createMutation.isPending}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {createMutation.isPending ? 'Creating...' : 'Create Lead'}
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