import React, {useEffect, useState} from 'react';
import {ArrowUpDown, Building2, Map, MapPin, MoreHorizontal, PlusCircle, Search, Trash2} from 'lucide-react';
import {Input} from "@/components/ui/input";
import {NumberInput} from "@/components/ui/number-input";
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {Badge} from "@/components/ui/badge";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    ConstructionType,
    createProperty,
    deleteProperty,
    fetchAllProperties,
    OccupancyType
} from '../services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {z} from 'zod';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import AdminLayout from '../layouts/AdminLayout';
import {City, VN_LOCATIONS} from '@/lib/vn-locations';
import {SearchableSelect} from "@/components/ui/searchable-select.tsx";

const constructionTypeValues = Object.values(ConstructionType) as [string, ...string[]];
const occupancyTypeValues = Object.values(OccupancyType) as [string, ...string[]];

const propertySchema = z.object({
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
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' ₫';
};

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replace(/_/g, ' ');
};

const AdminPropertiesView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [costDisplay, setCostDisplay] = useState('');

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
            setSelectedCity(null);
            setCostDisplay('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-properties']});
        }
    });

    const {register, handleSubmit, reset, control, setValue, formState: {errors}} = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema) as any,
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

    useEffect(() => {
        if (selectedCity) {
            setValue('location.city', selectedCity.name);
        }
    }, [selectedCity, setValue]);


    const onSubmit = (data: PropertyFormValues) => {
        // Safe cast as we know the strings from z.enum are valid enum values
        createMutation.mutate({
            ...data,
            attributes: {
                ...data.attributes,
                constructionType: data.attributes.constructionType as unknown as ConstructionType,
                occupancyType: data.attributes.occupancyType as unknown as OccupancyType,
            }
        });
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
        const fullAddress = `${prop.location.street}, ${prop.location.ward}, ${prop.location.city}`;
        return (
            fullAddress.toLowerCase().includes(term) ||
            prop.location.city.toLowerCase().includes(term) ||
            prop.location.zipCode.toLowerCase().includes(term) ||
            prop.attributes.occupancyType.toLowerCase().includes(term)
        );
    });

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        const val = parseInt(raw || '0', 10);
        setValue('valuation.estimatedConstructionCost', val);
        setCostDisplay(val === 0 ? '' : raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ₫');
    };

    const wardOptions = selectedCity?.wards.map(w => ({
        value: w.name,
        label: w.name,
        sublabel: w.zipCode
    })) || [];

    const columns: Column[] = [
        {
            header: <div className="flex items-center gap-2">Property address <ArrowUpDown className="h-3 w-3"/></div>,
            width: "30%",
            className: "text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors",
            onClick: () => handleSort('location.street')
        },
        {
            header: <div className="flex items-center gap-2"><Map className="h-3 w-3"/> Zip code <ArrowUpDown
                className="h-3 w-3"/></div>,
            width: "10%",
            className: "text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors",
            onClick: () => handleSort('location.zipCode')
        },
        {
            header: <div className="flex items-center gap-2">Type <ArrowUpDown className="h-3 w-3"/></div>,
            width: "10%",
            className: "text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors",
            onClick: () => handleSort('attributes.occupancyType')
        },
        {
            header: "Construction",
            width: "15%",
            className: "text-slate-400"
        },
        {
            header: <div className="flex items-center gap-2">Sq. meters <ArrowUpDown className="h-3 w-3"/></div>,
            width: "10%",
            className: "text-slate-400 cursor-pointer hover:text-indigo-400 transition-colors",
            onClick: () => handleSort('attributes.squareMeters')
        },
        {
            header: "Est. cost",
            width: "15%",
            className: "text-slate-400"
        },
        {
            header: "Actions",
            width: "10%",
            className: "text-right text-slate-400"
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex flex-col space-y-4 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <h3 className="font-semibold text-lg text-white">All properties</h3>
                                <p className="text-sm text-slate-400">Search and manage physical assets by address or
                                    location.</p>
                            </div>
                            <Button onClick={() => {
                                reset();
                                setSelectedCity(null);
                                setCostDisplay('');
                                setIsDialogOpen(true);
                            }} variant="outline"
                                    className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white">
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Create property
                            </Button>
                        </div>
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search by Address, City, or Zip Code..."
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
                            isLoading={isLoading}
                            isEmpty={!isLoading && filteredProperties.length === 0}
                            emptyMessage="No properties found."
                        >
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
                            ) : filteredProperties.map((prop) => (
                                <TableRow key={prop.id} className="border-slate-800 hover:bg-slate-900/50 group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                                <Building2 className="h-4 w-4"/>
                                            </div>
                                            <div>
                                                <div
                                                    className="font-medium text-slate-200">{prop.location.street}, {prop.location.ward}, {prop.location.city}</div>
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
                                            {formatEnum(prop.attributes.occupancyType)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        {formatEnum(prop.attributes.constructionType)}
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        {prop.attributes.squareMeters} m²
                                    </TableCell>
                                    <TableCell className="text-emerald-400 font-mono">
                                        {formatCurrency(prop.valuation.estimatedConstructionCost)}
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
                        </SharedTable>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent
                        className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create property</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Address</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Select onValueChange={(val) => {
                                        const city = VN_LOCATIONS.find(c => c.name === val) || null;
                                        setSelectedCity(city);
                                        setValue('location.ward', '');
                                        setValue('location.zipCode', '');
                                    }}>
                                        <SelectTrigger className="bg-slate-950 border-slate-800">
                                            <SelectValue placeholder="Select city"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VN_LOCATIONS.map(city => (
                                                <SelectItem key={city.name}
                                                            value={city.name}>{city.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" {...register('location.city')} />
                                    {errors.location?.city &&
                                        <p className="text-red-500 text-sm">{errors.location.city.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Ward</Label>
                                    <Controller
                                        control={control}
                                        name="location.ward"
                                        render={({field}) => (
                                            <SearchableSelect
                                                options={wardOptions}
                                                value={field.value}
                                                onChange={(val) => {
                                                    field.onChange(val);
                                                    const ward = selectedCity?.wards.find(w => w.name === val);
                                                    if (ward) {
                                                        setValue('location.zipCode', ward.zipCode);
                                                    }
                                                }}
                                                placeholder={selectedCity ? "Select ward" : "Select city first"}
                                                disabled={!selectedCity}
                                            />
                                        )}
                                    />
                                    {errors.location?.ward &&
                                        <p className="text-red-500 text-sm">{errors.location.ward.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">Zip code</Label>
                                    <Input
                                        id="zipCode"
                                        readOnly
                                        className="bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed"
                                        {...register('location.zipCode')}
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label>Street / House number</Label>
                                    <Input
                                        placeholder="e.g. Số 10, Ngõ 5"
                                        {...register('location.street')}
                                        className="bg-slate-950 border-slate-800"
                                    />
                                    {errors.location?.street &&
                                        <p className="text-red-500 text-sm">{errors.location.street.message}</p>}
                                </div>

                                <div className="col-span-2 space-y-2 pt-4">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Property
                                        details</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="constructionType">Construction type</Label>
                                    <Controller
                                        control={control}
                                        name="attributes.constructionType"
                                        render={({field}) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="bg-slate-950 border-slate-800">
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
                                    {errors.attributes?.constructionType &&
                                        <p className="text-red-500 text-sm">{errors.attributes.constructionType.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="occupancyType">Occupancy type</Label>
                                    <Controller
                                        control={control}
                                        name="attributes.occupancyType"
                                        render={({field}) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="bg-slate-950 border-slate-800">
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
                                    {errors.attributes?.occupancyType &&
                                        <p className="text-red-500 text-sm">{errors.attributes.occupancyType.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="yearBuilt">Year built</Label>
                                    <Controller
                                        control={control}
                                        name="attributes.yearBuilt"
                                        render={({field}) => (
                                            <NumberInput
                                                id="yearBuilt"
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder={new Date().getFullYear().toString()}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        )}
                                    />
                                    {errors.attributes?.yearBuilt &&
                                        <p className="text-red-500 text-sm">{errors.attributes.yearBuilt.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="noFloors">No. floors</Label>
                                    <Controller
                                        control={control}
                                        name="attributes.noFloors"
                                        render={({field}) => (
                                            <NumberInput
                                                id="noFloors"
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        )}
                                    />
                                    {errors.attributes?.noFloors &&
                                        <p className="text-red-500 text-sm">{errors.attributes.noFloors.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="squareMeters">Square meters</Label>
                                    <Controller
                                        control={control}
                                        name="attributes.squareMeters"
                                        render={({field}) => (
                                            <NumberInput
                                                id="squareMeters"
                                                step="0.01"
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Enter area..."
                                                className="bg-slate-950 border-slate-800"
                                            />
                                        )}
                                    />
                                    {errors.attributes?.squareMeters &&
                                        <p className="text-red-500 text-sm">{errors.attributes.squareMeters.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estimatedConstructionCost">Est. cost</Label>
                                    <Input
                                        id="estimatedConstructionCost"
                                        type="text"
                                        value={costDisplay}
                                        onChange={handleCostChange}
                                        placeholder="0 ₫"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                    {errors.valuation?.estimatedConstructionCost &&
                                        <p className="text-red-500 text-sm">{errors.valuation.estimatedConstructionCost.message}</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Create property
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminPropertiesView;