import React, {useState} from 'react';
import {ArrowUpDown, Building2, Eye, MapPin, MoreHorizontal} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {useQuery} from '@tanstack/react-query';
import {fetchAllProperties} from '../services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import AdminLayout from '../layouts/AdminLayout';
import {PropertyDetailDialog} from '@/features/admin/components/PropertyDetailDialog';

import {PropertyInfoDto} from "@/features/admin/services/propertyService";

const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' ₫';
};

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

const AdminPropertiesView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<PropertyInfoDto | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);


    const {data: properties, isLoading} = useQuery({
        queryKey: ['admin-properties', sortConfig],
        queryFn: () => fetchAllProperties(sortConfig?.key, sortConfig?.direction)
    });

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
            width: "30%",
            className: "text-text-muted cursor-pointer hover:text-primary transition-colors",
            onClick: () => handleSort('location.street')
        },


        {
            header: "Construction",
            width: "15%",
            className: "text-text-muted"
        },
        {
            header: <div className="flex items-center gap-2">Sq. meters <ArrowUpDown className="h-3 w-3"/></div>,
            width: "15%",
            className: "text-text-muted cursor-pointer hover:text-primary transition-colors",
            onClick: () => handleSort('attributes.squareMeters')
        },
        {
            header: "Est. cost",
            width: "15%",
            className: "text-text-muted"
        },
        {
            header: "",
            width: "10%",
            className: "text-right text-text-muted"
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">


                <div className="rounded-xl border border-border-main bg-surface-main text-text-main shadow-sm">
                    <div className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isLoading}
                            isEmpty={!isLoading && (!properties || properties.length === 0)}
                            emptyMessage="No properties found."
                        >
                            {isLoading ? (
                                ['skel-1', 'skel-2', 'skel-3', 'skel-4'].map((id) => (
                                    <TableRow key={id} className="border-border-main">
                                        <TableCell><Skeleton className="h-8 w-48 bg-muted"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 bg-muted"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 bg-muted"/></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 bg-muted"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-muted"/></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 bg-muted"/></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto bg-muted"/></TableCell>
                                    </TableRow>
                                ))
                            ) : properties?.map((prop) => (
                                <TableRow key={prop.id}
                                          className="border-b border-border-main hover:bg-muted group transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-text-muted border border-border-main">
                                                <Building2 className="h-4 w-4"/>
                                            </div>
                                            <div>
                                                <div
                                                    className="font-medium text-text-main">{prop.location.street}, {prop.location.ward}, {prop.location.city}</div>
                                                <div className="text-xs text-text-muted flex items-center gap-1">
                                                    <MapPin className="h-3 w-3"/>
                                                    {prop.location.city}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>


                                    <TableCell className="text-text-secondary">
                                        {formatEnum(prop.attributes.constructionType)}
                                    </TableCell>
                                    <TableCell className="text-text-secondary">
                                        {prop.attributes.squareMeters} m²
                                    </TableCell>
                                    <TableCell className="text-emerald-400 font-mono">
                                        {formatCurrency(prop.valuation.estimatedConstructionCost)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost"
                                                        className="h-8 w-8 p-0 text-text-secondary hover:text-text-main hover:bg-muted">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"
                                                                 className="bg-surface-main border-border-main text-text-main">
                                                <DropdownMenuItem onClick={() => handleViewDetail(prop)}
                                                                  className="focus:bg-muted focus:text-text-main cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4"/> View Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </SharedTable>
                    </div>
                </div>

            </div>

            <PropertyDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                property={selectedProperty}
            />
        </AdminLayout>
    );
};

export default AdminPropertiesView;