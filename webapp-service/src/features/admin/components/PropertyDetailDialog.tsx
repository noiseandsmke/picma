import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {PropertyInfoDto} from '../services/propertyService';
import {useQuery} from '@tanstack/react-query';
import {fetchUsers} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';

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
            <DialogContent className="sm:max-w-[600px] bg-[#141124] border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Property Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Owner
                            Information</h4>
                        {isOwnersLoading && (
                            <Skeleton className="h-16 w-full bg-slate-800"/>
                        )}
                        {!isOwnersLoading && owner && (
                            <div
                                className="bg-slate-900 p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-slate-500">Name:</span> {owner.firstName} {owner.lastName}
                                </div>
                                <div><span className="text-slate-500">Username:</span> {owner.username}</div>
                                <div><span className="text-slate-500">Email:</span> {owner.email}</div>
                                <div><span className="text-slate-500">Mobile:</span> {owner.mobile || '-'}</div>
                            </div>
                        )}
                        {!isOwnersLoading && !owner && (
                            <div className="text-slate-500 italic text-sm">Owner information not available or not
                                linked. (User ID: {property.userId})</div>
                        )}
                    </div>

                    <div className="border-t border-slate-800"/>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Location</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-slate-500 text-xs">Street</Label>
                                <div className="text-white">{property.location.street}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">Zip Code</Label>
                                <div className="text-white font-mono">{property.location.zipCode}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">Ward</Label>
                                <div className="text-white">{property.location.ward}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">City</Label>
                                <div className="text-white">{property.location.city}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800"/>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Attributes</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-slate-500 text-xs">Construction Type</Label>
                                <div className="text-white">{formatEnum(property.attributes.constructionType)}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">Occupancy Type</Label>
                                <div className="text-white">{formatEnum(property.attributes.occupancyType)}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">Year Built</Label>
                                <div className="text-white">{property.attributes.yearBuilt}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">Number of Floors</Label>
                                <div className="text-white">{property.attributes.noFloors}</div>
                            </div>
                            <div>
                                <Label className="text-slate-500 text-xs">Square Meters</Label>
                                <div className="text-white">{property.attributes.squareMeters} m²</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-800"/>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Valuation</h4>
                        <div className="text-sm">
                            <Label className="text-slate-500 text-xs">Estimated Construction Cost</Label>
                            <div
                                className="text-emerald-400 font-mono text-lg">{formatCurrency(property.valuation.estimatedConstructionCost)}</div>
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