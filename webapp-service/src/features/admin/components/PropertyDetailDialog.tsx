import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PropertyInfoDto } from '../services/propertyService';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, Ruler, Wallet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PropertyDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property: PropertyInfoDto | null;
}

const formatEnum = (val: string) => {
    return val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ') : '-';
};

const formatCurrency = (amount: number) => {
    return amount ? amount.toLocaleString() + ' ₫' : '0 ₫';
};

export const PropertyDetailDialog: React.FC<PropertyDetailDialogProps> = ({ open, onOpenChange, property }) => {
    const { data: owners, isLoading: isOwnersLoading } = useQuery({
        queryKey: ['admin-owners-lookup'],
        queryFn: () => fetchUsers('owner'),
        enabled: open && !!property?.userId,
    });

    if (!property) return null;

    const owner = owners?.find(u => u.id === property.userId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Property Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Owner
                            Information</h4>
                        {isOwnersLoading && (
                            <Skeleton className="h-16 w-full bg-slate-800" />
                        )}
                        {!isOwnersLoading && owner && (
                            <div
                                className="bg-slate-950 p-3 rounded-lg border border-slate-700/50 grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-slate-500">Name:</span> {owner.firstName} {owner.lastName}
                                </div>
                                <div><span className="text-slate-500">Username:</span> {owner.username}</div>
                                <div><span className="text-slate-500">Email:</span> {owner.email}</div>
                            </div>
                        )}
                        {!isOwnersLoading && !owner && (
                            <div className="text-slate-500 italic text-sm">Owner information not available or not
                                linked. (User ID: {property.userId})</div>
                        )}
                    </div>

                    <Separator className="bg-slate-700/50" />

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                                <MapPin size={18} />
                            </div>
                            <div className="space-y-1 flex-1">
                                <h4 className="text-sm font-medium text-slate-300">Location</h4>
                                <p className="text-sm text-white font-medium">{property.location.street}</p>
                                <p className="text-xs text-slate-500">
                                    {property.location.ward}, {property.location.city}
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-slate-700/50" />

                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-1">
                                <Building2 size={18} />
                            </div>
                            <div className="space-y-3 flex-1">
                                <h4 className="text-sm font-medium text-slate-300">Attributes</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-500 text-xs">Type:</span> <span
                                            className="text-white">{formatEnum(property.attributes.constructionType)}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs">Year Built:</span> <span
                                            className="text-white">{property.attributes.yearBuilt}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs">Floors:</span> <span
                                            className="text-white">{property.attributes.noFloors}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-700/50" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400 mt-1">
                                    <Ruler size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-300">Area</h4>
                                    <p className="text-sm font-medium text-white">{property.attributes.squareMeters} m²</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400 mt-1">
                                    <Wallet size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-300">Est. Cost</h4>
                                    <p className="text-sm font-medium text-emerald-400">
                                        {formatCurrency(property.valuation.estimatedConstructionCost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};