import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createLead, deleteLead, fetchAllLeads} from '../services/leadService';
import {fetchAllProperties} from '../services/propertyService';
import {
    ArrowUpDown,
    Building2,
    Clock,
    Eye,
    Filter,
    MoreHorizontal,
    PlusCircle,
    Search,
    Trash2,
    User
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from '@/components/ui/shared-table';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Checkbox} from '@/components/ui/checkbox';
import {LEAD_STATUS_CONFIG} from '../utils/statusMapping';
import {SearchableSelect} from '@/components/ui/searchable-select';

const createLeadSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    phoneNumber: z.string().min(1, 'Phone Number is required'),
    email: z.email('Invalid email address'),
    propertyId: z.string().min(1, 'Property is required'),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

const AdminLeadsView: React.FC = () => {
    const queryClient = useQueryClient();
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const {
        data: properties,
        isLoading: isPropertiesLoading
    } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: fetchAllProperties,
    });

    const {
        handleSubmit,
        reset,
        control,
        watch,
        formState: {errors},
    } = useForm<CreateLeadFormData>({
        resolver: zodResolver(createLeadSchema),
        defaultValues: {
            fullName: '',
            phoneNumber: '',
            email: '',
            propertyId: '',
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

    const deleteMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-leads']});
        }
    });

    const onSubmit = (data: CreateLeadFormData) => {
        const userInfo = `${data.fullName} - ${data.phoneNumber} - ${data.email}`;

        const payload = {
            userInfo,
            propertyInfo: data.propertyId,
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

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev => {
            if (prev.includes(status)) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const parseUserInfo = (userInfo: string) => {
        if (!userInfo) return {name: 'Unknown', details: ''};

        const parts = userInfo.split(' - ');
        if (parts.length >= 2) {
            return {
                name: parts[0],
                details: parts.slice(1).join(' • ')
            };
        }
        return {name: userInfo, details: ''};
    };

    const renderPropertyCell = (propertyInfoStr: string) => {
        if (properties && properties.length > 0) {
            const matchedProp = properties.find(p => String(p.id) === String(propertyInfoStr));
            if (matchedProp) {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-200 truncate">{matchedProp.location.street}</span>
                        <span className="text-xs text-slate-500 truncate">{matchedProp.location.city}</span>
                    </div>
                );
            }
        }

        try {
            const obj = JSON.parse(propertyInfoStr);
            if (obj && obj.address) {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-200 truncate">{obj.address}</span>
                        <span className="text-xs text-slate-500 truncate">{obj.city}</span>
                    </div>
                );
            }
        } catch {
        }

        // Fallback for raw string
        return (
            <div className="flex items-center gap-2">
                <span className="truncate max-w-[200px]" title={propertyInfoStr}>
                    {propertyInfoStr}
                </span>
            </div>
        );
    };

    const filteredLeads = leads?.filter(lead => {
        const matchesSearch =
            lead.userInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(lead.id).includes(searchTerm);

        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(lead.status);

        return matchesSearch && matchesStatus;
    });

    const columns: Column[] = [
        {
            header: (
                <div className="flex items-center gap-1">
                    ID {sortConfig.key === 'id' && <ArrowUpDown size={14}/>}
                </div>
            ),
            width: "5%",
            onClick: () => handleSort('id'),
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    User Info {sortConfig.key === 'userInfo' && <ArrowUpDown size={14}/>}
                </div>
            ),
            width: "30%",
            onClick: () => handleSort('userInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    Property {sortConfig.key === 'propertyInfo' && <ArrowUpDown size={14}/>}
                </div>
            ),
            width: "30%",
            onClick: () => handleSort('propertyInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <span className="cursor-pointer" onClick={() => handleSort('status')}>
                        Status {sortConfig.key === 'status' && <ArrowUpDown size={14}/>}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost"
                                    className="h-6 w-6 p-0 hover:bg-slate-800 rounded-full relative">
                                <Filter
                                    className={cn("h-3 w-3", selectedStatuses.length > 0 ? "text-indigo-400" : "text-slate-500")}/>
                                {selectedStatuses.length > 0 && (
                                    <span
                                        className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 border border-slate-900"/>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start"
                                             className="bg-slate-900 border-slate-800 text-slate-200 w-56">
                            <DropdownMenuLabel
                                className="text-xs font-normal text-slate-500 uppercase tracking-wider px-2 py-1.5">
                                Filter by status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800"/>

                            <DropdownMenuItem
                                className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedStatuses([]);
                                }}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Checkbox
                                        checked={selectedStatuses.length === 0}
                                        className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 pointer-events-none"
                                    />
                                    <span className="text-sm">All Statuses</span>
                                </div>
                            </DropdownMenuItem>

                            {Object.values(LEAD_STATUS_CONFIG).map((config) => (
                                <DropdownMenuItem
                                    key={config.value}
                                    className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        toggleStatus(config.value);
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <Checkbox
                                            checked={selectedStatuses.includes(config.value)}
                                            className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 pointer-events-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn("h-2 w-2 rounded-full", config.dotClass)}/>
                                            <span className="text-sm">{config.label}</span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            width: "15%",
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    Created {sortConfig.key === 'createDate' && <ArrowUpDown size={14}/>}
                </div>
            ),
            width: "15%",
            onClick: () => handleSort('createDate'),
        },
        {
            header: "Actions",
            width: "5%",
        }
    ];

    const selectedPropertyId = watch('propertyId');
    const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

    return (
        <AdminLayout>
            <div className="space-y-6">
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
                        </div>
                    </div>

                    <div className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isLeadsLoading}
                            isEmpty={!isLeadsLoading && !isLeadsError && (!filteredLeads || filteredLeads.length === 0)}
                            emptyMessage="No leads found matching your criteria."
                        >
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-400">
                                        Failed to load leads data.
                                    </TableCell>
                                </TableRow>
                            ) : filteredLeads?.map((lead) => {
                                const {name, details} = parseUserInfo(lead.userInfo);

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
                                            {renderPropertyCell(lead.propertyInfo)}
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.ACTIVE;
                                                return (
                                                    <Badge variant="outline"
                                                           className={cn("border-0 font-medium", statusConfig.className)}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                );
                                            })()}
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
                            })}
                        </SharedTable>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
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
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Property
                                    Selection</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="propertyId" className="text-slate-300">Select Property</Label>
                                        <Controller
                                            name="propertyId"
                                            control={control}
                                            render={({field}) => (
                                                <SearchableSelect
                                                    options={properties?.map(p => ({
                                                        value: p.id,
                                                        label: p.location.street,
                                                        sublabel: p.location.city
                                                    })) || []}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Search property by address..."
                                                    className="mt-1.5"
                                                    isLoading={isPropertiesLoading}
                                                />
                                            )}
                                        />
                                        {errors.propertyId &&
                                            <p className="text-red-500 text-xs mt-1">{errors.propertyId.message}</p>}
                                    </div>

                                    {selectedProperty && (
                                        <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4 mt-2">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                                                    <Building2 className="h-5 w-5 text-indigo-400"/>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h5 className="font-medium text-slate-200 text-sm">{selectedProperty.location.street}</h5>
                                                    <div className="text-xs text-slate-400 space-y-0.5">
                                                        <p>{selectedProperty.location.ward}, {selectedProperty.location.city}</p>
                                                        <p className="text-indigo-400 font-medium pt-1">
                                                            Est.
                                                            Cost: {selectedProperty.valuation.estimatedConstructionCost.toLocaleString()} VND
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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