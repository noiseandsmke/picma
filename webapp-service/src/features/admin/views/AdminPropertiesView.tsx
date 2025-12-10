import React, {useState} from 'react';
import {ArrowUpDown, Building2, Eye, Map, MapPin, MoreHorizontal, Trash2} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {Badge} from "@/components/ui/badge";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {deleteProperty, fetchAllProperties} from '../services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import AdminLayout from '../layouts/AdminLayout';
import {ConfirmDialog} from '@/components/ui/confirm-dialog';
import {PropertyDetailDialog} from '@/features/admin/components/PropertyDetailDialog';
import {toast} from 'sonner';
import {PropertyInfoDto} from "@/features/admin/services/propertyService";

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' ₫';
};

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

const AdminPropertiesView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<PropertyInfoDto | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const queryClient = useQueryClient();

    const {data: properties, isLoading} = useQuery({
        queryKey: ['admin-properties', sortConfig],
        queryFn: () => fetchAllProperties(sortConfig?.key, sortConfig?.direction)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProperty,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-properties']});
            setDeleteId(null);
            toast.success("Property deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete property");
        }
    });

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleViewDetail = (prop: PropertyInfoDto) => {
        setSelectedProperty(prop);
        setIsDetailOpen(true);
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const columns: Column[] = [
        {
            header: <div className="flex items-center gap-2">Property address <ArrowUpDown className="h-3 w-3"/></div>,
            width: "35%",
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
            width: "5%",
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
                        </div>
                    </div>
                    <div className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isLoading}
                            isEmpty={!isLoading && (!properties || properties.length === 0)}
                            emptyMessage="No properties found."
                        >
                            {isLoading ? (
                                ['skel-1', 'skel-2', 'skel-3', 'skel-4'].map((id) => (
                                    <TableRow key={id} className="border-slate-800">
                                        <TableCell><Skeleton className="h-8 w-48 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
                                    </TableRow>
                                ))
                            ) : properties?.map((prop) => (
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
                                                <DropdownMenuItem onClick={() => handleViewDetail(prop)}
                                                                  className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4"/> View Details
                                                </DropdownMenuItem>
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

                <ConfirmDialog
                    open={deleteId !== null}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    title="Delete Property"
                    description="Are you sure you want to delete this property? This action cannot be undone."
                    onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                    confirmText="Delete"
                    variant="destructive"
                />

                <PropertyDetailDialog
                    open={isDetailOpen}
                    onOpenChange={setIsDetailOpen}
                    property={selectedProperty}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminPropertiesView;