import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createLead, CreateLeadDto, deleteLead, fetchAllLeads} from '../services/leadService';
import {
    ConstructionType,
    createProperty,
    fetchAllProperties,
    OccupancyType,
    PropertyInfoDto
} from '../services/propertyService';
import {fetchUsers} from '../services/userService';
import {ArrowUpDown, Clock, Eye, Filter, MoreHorizontal, PlusCircle, Search, Trash2, User} from 'lucide-react';
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
import {toast} from 'sonner';
import {ConfirmDialog} from '@/components/ui/confirm-dialog';
import {City, VN_LOCATIONS} from '@/lib/vn-locations';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {NumberInput} from '@/components/ui/number-input';

const constructionTypeValues = Object.values(ConstructionType) as [string, ...string[]];
const occupancyTypeValues = Object.values(OccupancyType) as [string, ...string[]];

const createLeadSchema = z.object({
    userId: z.string().min(1, 'User (Owner) is required'),
    property: z.object({
        location: z.object({
            street: z.string().min(1, "Street is required"),
            ward: z.string().min(1, "Ward is required"),
            city: z.string().min(1, "City is required"),
            zipCode: z.string().min(1, "Zip Code is required"),
        }),
        attributes: z.object({
            constructionType: z.enum(constructionTypeValues),
            occupancyType: z.enum(occupancyTypeValues),
            yearBuilt: z.coerce.number().min(1800, "Year Built must be valid"),
            noFloors: z.coerce.number().min(1, "Number of floors must be at least 1"),
            squareMeters: z.coerce.number().min(1, "Square Meters must be positive"),
        }),
        valuation: z.object({
            estimatedConstructionCost: z.coerce.number().min(0, "Cost must be positive"),
        }),
    })
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replace(/_/g, ' ');
};

const AdminLeadsView: React.FC = () => {
    const queryClient = useQueryClient();
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [costDisplay, setCostDisplay] = useState('');

    const {
        data: properties,
    } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: fetchAllProperties,
    });

    const {
        data: owners,
        isLoading: isOwnersLoading
    } = useQuery({
        queryKey: ['admin-owners'],
        queryFn: () => fetchUsers('owner'),
    });

    const {
        handleSubmit,
        reset,
        control,
        setValue,
        register,
        formState: {errors},
    } = useForm<CreateLeadFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createLeadSchema) as any,
        defaultValues: {
            userId: '',
            property: {
                location: {
                    city: '',
                    ward: '',
                    zipCode: '',
                    street: '',
                },
                attributes: {
                    yearBuilt: new Date().getFullYear(),
                    noFloors: 1,
                    squareMeters: 0,
                    // Default enum values will be handled by Select components or validation
                },
                valuation: {
                    estimatedConstructionCost: 0
                }
            }
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

    const createPropertyMutation = useMutation({
        mutationFn: createProperty,
    });

    const createLeadMutation = useMutation({
        mutationFn: createLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-leads']});
            await queryClient.invalidateQueries({queryKey: ['admin-properties']});
            setIsModalOpen(false);
            reset();
            setSelectedCity(null);
            setCostDisplay('');
            toast.success("Lead created successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create lead");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-leads']});
            setDeleteId(null);
            toast.success("Lead deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete lead");
        }
    });

    const onSubmit = async (data: CreateLeadFormData) => {
        try {
            const owner = owners?.find(u => u.id === data.userId);
            if (!owner) {
                toast.error("Selected owner not found");
                return;
            }

            // 1. Create Property
            const propertyPayload: Omit<PropertyInfoDto, 'id'> = {
                userId: data.userId,
                location: data.property.location,
                attributes: {
                    ...data.property.attributes,
                    constructionType: data.property.attributes.constructionType as unknown as ConstructionType,
                    occupancyType: data.property.attributes.occupancyType as unknown as OccupancyType,
                },
                valuation: data.property.valuation
            };

            const createdProperty = await createPropertyMutation.mutateAsync(propertyPayload);

            // 2. Create Lead
            const userInfo = `${owner.firstName} ${owner.lastName} - ${owner.mobile} - ${owner.email}`;
            const leadPayload: CreateLeadDto = {
                userInfo,
                propertyInfo: createdProperty.id,
                status: 'ACTIVE',
                userId: data.userId
            };

            createLeadMutation.mutate(leadPayload);
        } catch (error) {
            console.error("Error in lead creation flow:", error);
            toast.error("Failed to create property or lead");
        }
    };

    const handleCreate = () => {
        reset();
        setSelectedCity(null);
        setCostDisplay('');
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
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
            // Ignore error
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

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        const val = parseInt(raw || '0', 10);
        setValue('property.valuation.estimatedConstructionCost', val);
        setCostDisplay(val === 0 ? '' : raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ₫');
    };

    const wardOptions = selectedCity?.wards.map(w => ({
        value: w.name,
        label: w.name,
        sublabel: w.zipCode
    })) || [];

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
                    <DialogContent
                        className="bg-slate-950 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Lead</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                            {/* Section 1: Owner Selection */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Owner
                                    Selection</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="userId" className="text-slate-300">Select Owner</Label>
                                        <Controller
                                            name="userId"
                                            control={control}
                                            render={({field}) => (
                                                <SearchableSelect
                                                    options={owners?.map(u => ({
                                                        value: u.id || '',
                                                        label: `${u.firstName} ${u.lastName}`,
                                                        sublabel: u.email
                                                    })) || []}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Search owner by name..."
                                                    className="mt-1.5"
                                                    isLoading={isOwnersLoading}
                                                />
                                            )}
                                        />
                                        {errors.userId &&
                                            <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-800"/>

                            {/* Section 2: Property Creation */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Create
                                    Property</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Controller
                                            control={control}
                                            name="property.location.city"
                                            render={({field}) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        const city = VN_LOCATIONS.find(c => c.name === val) || null;
                                                        setSelectedCity(city);
                                                        setValue('property.location.ward', '');
                                                        setValue('property.location.zipCode', '');
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                                        <SelectValue placeholder="Select city"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {VN_LOCATIONS.map(city => (
                                                            <SelectItem key={city.name}
                                                                        value={city.name}>{city.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.property?.location?.city &&
                                            <p className="text-red-500 text-xs">{errors.property.location.city.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ward</Label>
                                        <Controller
                                            control={control}
                                            name="property.location.ward"
                                            render={({field}) => (
                                                <SearchableSelect
                                                    options={wardOptions}
                                                    value={field.value}
                                                    onChange={(val) => {
                                                        field.onChange(val);
                                                        const ward = selectedCity?.wards.find(w => w.name === val);
                                                        if (ward) {
                                                            setValue('property.location.zipCode', ward.zipCode);
                                                        }
                                                    }}
                                                    placeholder={selectedCity ? "Select ward" : "Select city first"}
                                                    disabled={!selectedCity}
                                                />
                                            )}
                                        />
                                        {errors.property?.location?.ward &&
                                            <p className="text-red-500 text-xs">{errors.property.location.ward.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">Zip code</Label>
                                        <Input
                                            id="zipCode"
                                            readOnly
                                            className="bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed"
                                            {...register('property.location.zipCode')}
                                        />
                                        {errors.property?.location?.zipCode &&
                                            <p className="text-red-500 text-xs">{errors.property.location.zipCode.message}</p>}
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label>Street / House number</Label>
                                        <Input
                                            placeholder="e.g. Số 10, Ngõ 5"
                                            {...register('property.location.street')}
                                            className="bg-slate-900 border-slate-700"
                                        />
                                        {errors.property?.location?.street &&
                                            <p className="text-red-500 text-xs">{errors.property.location.street.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="constructionType">Construction type</Label>
                                        <Controller
                                            control={control}
                                            name="property.attributes.constructionType"
                                            render={({field}) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                                        <SelectValue placeholder="Select type"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(ConstructionType).map((type) => (
                                                            <SelectItem key={type}
                                                                        value={type}>{formatEnum(type)}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.property?.attributes?.constructionType &&
                                            <p className="text-red-500 text-xs">{errors.property.attributes.constructionType.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="occupancyType">Occupancy type</Label>
                                        <Controller
                                            control={control}
                                            name="property.attributes.occupancyType"
                                            render={({field}) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                                        <SelectValue placeholder="Select type"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(OccupancyType).map((type) => (
                                                            <SelectItem key={type}
                                                                        value={type}>{formatEnum(type)}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.property?.attributes?.occupancyType &&
                                            <p className="text-red-500 text-xs">{errors.property.attributes.occupancyType.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yearBuilt">Year built</Label>
                                        <Controller
                                            control={control}
                                            name="property.attributes.yearBuilt"
                                            render={({field}) => (
                                                <NumberInput
                                                    id="yearBuilt"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder={new Date().getFullYear().toString()}
                                                    className="bg-slate-900 border-slate-700"
                                                />
                                            )}
                                        />
                                        {errors.property?.attributes?.yearBuilt &&
                                            <p className="text-red-500 text-xs">{errors.property.attributes.yearBuilt.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="noFloors">No. floors</Label>
                                        <Controller
                                            control={control}
                                            name="property.attributes.noFloors"
                                            render={({field}) => (
                                                <NumberInput
                                                    id="noFloors"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="bg-slate-900 border-slate-700"
                                                />
                                            )}
                                        />
                                        {errors.property?.attributes?.noFloors &&
                                            <p className="text-red-500 text-xs">{errors.property.attributes.noFloors.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="squareMeters">Square meters</Label>
                                        <Controller
                                            control={control}
                                            name="property.attributes.squareMeters"
                                            render={({field}) => (
                                                <NumberInput
                                                    id="squareMeters"
                                                    step="0.01"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Enter area..."
                                                    className="bg-slate-900 border-slate-700"
                                                />
                                            )}
                                        />
                                        {errors.property?.attributes?.squareMeters &&
                                            <p className="text-red-500 text-xs">{errors.property.attributes.squareMeters.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estimatedConstructionCost">Est. cost</Label>
                                        <Input
                                            id="estimatedConstructionCost"
                                            type="text"
                                            value={costDisplay}
                                            onChange={handleCostChange}
                                            placeholder="0 ₫"
                                            className="bg-slate-900 border-slate-700"
                                        />
                                        {errors.property?.valuation?.estimatedConstructionCost &&
                                            <p className="text-red-500 text-xs">{errors.property.valuation.estimatedConstructionCost.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit"
                                        disabled={createLeadMutation.isPending || createPropertyMutation.isPending}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {(createLeadMutation.isPending || createPropertyMutation.isPending) ? 'Creating...' : 'Create Lead'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Delete Lead"
                    description="Are you sure you want to delete this lead? This action cannot be undone."
                    onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                    confirmText="Delete"
                    variant="destructive"
                />
            </div>
        </AdminLayout>
    );
};

export default AdminLeadsView;