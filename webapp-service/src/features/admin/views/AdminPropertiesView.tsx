import React, {useState} from 'react';
import {ArrowUpDown, Building2, MapPin, MoreHorizontal, Plus, Search, Trash2} from 'lucide-react';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createProperty, deleteProperty, fetchAllProperties,} from '../services/propertyService';
import {CONSTRUCTION_TYPES, ConstructionType, OCCUPANCY_TYPES, OccupancyType} from '@/types/enums';
import {Skeleton} from '@/components/ui/skeleton';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {z} from 'zod';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import AdminLayout from '../layouts/AdminLayout';

const propertySchema = z.object({
    location: z.object({
        fullAddress: z.string().min(1, "Address is required"),
        ward: z.string().min(1, "Ward is required"),
        city: z.string().min(1, "City is required"),
        zipCode: z.string().min(1, "Zip Code is required"),
    }),
    attributes: z.object({
        constructionType: z.nativeEnum(ConstructionType),
        occupancyType: z.nativeEnum(OccupancyType),
        yearBuilt: z.coerce.number().min(1800, "Year Built must be valid"),
        noFloors: z.coerce.number().min(1, "Number of floors must be at least 1"),
        squareMeters: z.coerce.number().min(1, "Square Meters must be positive"),
    }),
    valuation: z.object({
        estimatedConstructionCost: z.coerce.number().min(0, "Cost must be positive"),
    }),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const AdminPropertiesView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const queryClient = useQueryClient();

    const {data: properties, isLoading} = useQuery({
        queryKey: ['admin-properties'],
        queryFn: fetchAllProperties
    });

    const createMutation = useMutation({
        mutationFn: createProperty,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-properties']});
            setIsDialogOpen(false);
            reset();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-properties']});
        }
    });

    const {register, handleSubmit, reset, control, formState: {errors}} = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            attributes: {
                yearBuilt: new Date().getFullYear(),
                noFloors: 1,
                squareMeters: 0,
            },
            valuation: {
                estimatedConstructionCost: 0
            }
        }
    });

    const onSubmit = (data: PropertyFormValues) => {
        createMutation.mutate(data);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this property?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const sortedProperties = React.useMemo(() => {
        if (!properties) return [];
        const sortableProperties = [...properties];
        if (sortConfig !== null) {
            sortableProperties.sort((a, b) => {
                let aValue: unknown = a;
                let bValue: unknown = b;

                // Helper to access nested properties
                const keys = sortConfig.key.split('.') as (keyof typeof a)[];
                for (const k of keys) {
                    if (aValue && typeof aValue === 'object') {
                        aValue = (aValue as Record<string, unknown>)[k];
                    }
                    if (bValue && typeof bValue === 'object') {
                        bValue = (bValue as Record<string, unknown>)[k];
                    }
                }

                if (aValue === undefined || bValue === undefined) return 0;

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }

                if ((aValue as number) < (bValue as number)) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if ((aValue as number) > (bValue as number)) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableProperties;
    }, [properties, sortConfig]);

    const filteredProperties = sortedProperties.filter(prop => {
        const term = searchTerm.toLowerCase();
        return (
            prop.location.fullAddress.toLowerCase().includes(term) ||
            prop.location.city.toLowerCase().includes(term) ||
            prop.location.zipCode.toLowerCase().includes(term) ||
            prop.attributes.occupancyType.toLowerCase().includes(term)
        );
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Property Info</h2>
                        <p className="text-slate-400">Search and manage physical assets by address or location.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                reset();
                            }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="h-4 w-4 mr-2"/>
                                Create Property
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Property</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="fullAddress">Full Address</Label>
                                        <Input id="fullAddress" {...register('location.fullAddress')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.location?.fullAddress &&
                                            <p className="text-red-500 text-sm">{errors.location.fullAddress.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ward">Ward</Label>
                                        <Input id="ward" {...register('location.ward')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.location?.ward &&
                                            <p className="text-red-500 text-sm">{errors.location.ward.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" {...register('location.city')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.location?.city &&
                                            <p className="text-red-500 text-sm">{errors.location.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">Zip Code</Label>
                                        <Input id="zipCode" {...register('location.zipCode')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.location?.zipCode &&
                                            <p className="text-red-500 text-sm">{errors.location.zipCode.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="constructionType">Construction Type</Label>
                                        <Controller
                                            control={control}
                                            name="attributes.constructionType"
                                            render={({field}) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-slate-950 border-slate-800">
                                                        <SelectValue placeholder="Select Type"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CONSTRUCTION_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.attributes?.constructionType &&
                                            <p className="text-red-500 text-sm">{errors.attributes.constructionType.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="occupancyType">Occupancy Type</Label>
                                        <Controller
                                            control={control}
                                            name="attributes.occupancyType"
                                            render={({field}) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-slate-950 border-slate-800">
                                                        <SelectValue placeholder="Select Type"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {OCCUPANCY_TYPES.map((type) => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.attributes?.occupancyType &&
                                            <p className="text-red-500 text-sm">{errors.attributes.occupancyType.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yearBuilt">Year Built</Label>
                                        <Input id="yearBuilt" type="number" {...register('attributes.yearBuilt')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.attributes?.yearBuilt &&
                                            <p className="text-red-500 text-sm">{errors.attributes.yearBuilt.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="noFloors">No. Floors</Label>
                                        <Input id="noFloors" type="number" {...register('attributes.noFloors')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.attributes?.noFloors &&
                                            <p className="text-red-500 text-sm">{errors.attributes.noFloors.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="squareMeters">Square Meters</Label>
                                        <Input id="squareMeters" type="number"
                                               step="0.01" {...register('attributes.squareMeters')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.attributes?.squareMeters &&
                                            <p className="text-red-500 text-sm">{errors.attributes.squareMeters.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="estimatedConstructionCost">Est. Cost</Label>
                                        <Input id="estimatedConstructionCost" type="number"
                                               step="0.01" {...register('valuation.estimatedConstructionCost')}
                                               className="bg-slate-950 border-slate-800"/>
                                        {errors.valuation?.estimatedConstructionCost &&
                                            <p className="text-red-500 text-sm">{errors.valuation.estimatedConstructionCost.message}</p>}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    Create Property
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search by Address, City, or Zip Code..."
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
                                    <TableHead onClick={() => handleSort('location.fullAddress')}
                                               className="text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors">
                                        <div className="flex items-center gap-2">Property Address <ArrowUpDown
                                            className="h-3 w-3"/></div>
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('location.zipCode')}
                                               className="text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors">
                                        <div className="flex items-center gap-2">Zip Code <ArrowUpDown
                                            className="h-3 w-3"/></div>
                                    </TableHead>
                                    <TableHead onClick={() => handleSort('attributes.occupancyType')}
                                               className="text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors">
                                        <div className="flex items-center gap-2">Type <ArrowUpDown className="h-3 w-3"/>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400">Construction</TableHead>
                                    <TableHead onClick={() => handleSort('attributes.squareMeters')}
                                               className="text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors">
                                        <div className="flex items-center gap-2">Sq. Meters <ArrowUpDown
                                            className="h-3 w-3"/></div>
                                    </TableHead>
                                    <TableHead className="text-slate-400">Est. Cost</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({length: 4}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-8 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredProperties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            No properties found.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProperties.map((prop) => (
                                    <TableRow key={prop.id} className="border-slate-800 hover:bg-slate-800/50 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <Building2 className="h-4 w-4"/>
                                                </div>
                                                <div>
                                                    <div
                                                        className="font-medium text-slate-200">{prop.location.fullAddress}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3"/>
                                                        {prop.location.city}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {prop.location.zipCode}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary"
                                                   className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                                {prop.attributes.occupancyType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {prop.attributes.constructionType}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {prop.attributes.squareMeters} m²
                                        </TableCell>
                                        <TableCell className="text-emerald-400 font-mono">
                                            ${prop.valuation.estimatedConstructionCost.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4 text-slate-500"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end"
                                                                     className="bg-slate-900 border-slate-800 text-slate-200">
                                                    <DropdownMenuItem onClick={() => handleDelete(prop.id)}
                                                                      className="hover:bg-slate-800 text-red-400 cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default AdminPropertiesView;