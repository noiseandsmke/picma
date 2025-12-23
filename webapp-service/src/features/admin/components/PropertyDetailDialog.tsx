import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {PropertyInfoDto} from '../services/propertyService';
import {useQuery} from '@tanstack/react-query';
import {fetchUsers} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import {Building2, MapPin, Ruler, Wallet} from 'lucide-react';
import {Separator} from '@/components/ui/separator';

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

export const PropertyDetailDialog: React.FC<PropertyDetailDialogProps> = ({open, onOpenChange, property}) => {
    const {data: owners, isLoading: isOwnersLoading} = useQuery({
        queryKey: ['admin-owners-lookup'],
        queryFn: () => fetchUsers('owner'),
        enabled: open && !!property?.userId,
    });

    if (!property) return null;

    const owner = owners?.find(u => u.id === property.userId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-surface-main border-border-main text-text-main">
                <DialogHeader>
                    <DialogTitle className="text-text-main">Property Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Owner
                            Information</h4>
                        {isOwnersLoading && (
                            <Skeleton className="h-16 w-full bg-muted"/>
                        )}
                        {!isOwnersLoading && owner && (
                            <div
                                className="bg-muted p-3 rounded-lg border border-border-main grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-text-muted">Name:</span> {owner.firstName} {owner.lastName}
                                </div>
                                <div><span className="text-text-muted">Username:</span> {owner.username}</div>
                                <div><span className="text-text-muted">Email:</span> {owner.email}</div>
                            </div>
                        )}
                        {!isOwnersLoading && !owner && (
                            <div className="text-text-muted italic text-sm">Owner information not available or not
                                linked. (User ID: {property.userId})</div>
                        )}
                    </div>

                    <Separator className="bg-slate-700/50"/>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                                <MapPin size={18}/>
                            </div>
                            <div className="space-y-1 flex-1">
                                <h4 className="text-sm font-medium text-text-secondary">Location</h4>
                                <p className="text-sm text-text-main font-medium">{property.location.street}</p>
                                <p className="text-xs text-text-muted">
                                    {property.location.ward}, {property.location.city}
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-slate-700/50"/>

                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-1">
                                <Building2 size={18}/>
                            </div>
                            <div className="space-y-3 flex-1">
                                <h4 className="text-sm font-medium text-text-secondary">Attributes</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-text-muted text-xs">Type:</span> <span
                                        className="text-text-main">{formatEnum(property.attributes.constructionType)}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted text-xs">Year Built:</span> <span
                                        className="text-text-main">{property.attributes.yearBuilt}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted text-xs">Floors:</span> <span
                                        className="text-text-main">{property.attributes.noFloors}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-700/50"/>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400 mt-1">
                                    <Ruler size={18}/>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-text-secondary">Area</h4>
                                    <p className="text-sm font-medium text-text-main">{property.attributes.squareMeters} m²</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400 mt-1">
                                    <Wallet size={18}/>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-text-secondary">Est. Cost</h4>
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
                            className="border-input-border text-text-secondary hover:bg-muted hover:text-text-main">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};