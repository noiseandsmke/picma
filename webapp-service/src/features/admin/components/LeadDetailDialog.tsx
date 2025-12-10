import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {fetchPropertyById, PropertyInfoDto} from '../services/propertyService';
import {fetchUserById, UserDto} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import {Building2, MapPin, Ruler, Wallet} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';

interface LeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    createDate: string;
}

interface LeadDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadDto | null;
}

export const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({open, onOpenChange, lead}) => {
    const [propertyDetails, setPropertyDetails] = useState<PropertyInfoDto | null>(null);
    const [userDetails, setUserDetails] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLegacy, setIsLegacy] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [legacyDetails, setLegacyDetails] = useState<any>(null);

    useEffect(() => {
        if (!lead || !open) {
            setPropertyDetails(null);
            setLegacyDetails(null);
            setUserDetails(null);
            return;
        }

        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const parsed = JSON.parse(lead.propertyInfo);
                setIsLegacy(true);
                setLegacyDetails(parsed);
                setPropertyDetails(null);
            } catch {
                setIsLegacy(false);
                setLegacyDetails(null);
                try {
                    const data = await fetchPropertyById(lead.propertyInfo);
                    setPropertyDetails(data);
                } catch (error) {
                    console.error("Failed to fetch property details", error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUserDetails = async () => {
            if (lead.userInfo && !lead.userInfo.includes(' - ')) {
                try {
                    const user = await fetchUserById(lead.userInfo);
                    setUserDetails(user);
                } catch {
                    setUserDetails(null);
                }
            } else {
                setUserDetails(null);
            }
        };

        fetchDetails();
        fetchUserDetails();
    }, [lead, open]);

    if (!lead) return null;

    const renderPropertyContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4 bg-slate-800"/>
                    <Skeleton className="h-4 w-1/2 bg-slate-800"/>
                    <Skeleton className="h-24 w-full bg-slate-800"/>
                </div>
            );
        }

        if (isLegacy && legacyDetails) {
            return (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Address</span>
                            <span
                                className="text-slate-300">{legacyDetails.address || legacyDetails.location?.street}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">City</span>
                            <span className="text-slate-300">{legacyDetails.city || legacyDetails.location?.city}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (propertyDetails) {
            return (
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400 mt-1">
                            <MapPin size={18}/>
                        </div>
                        <div className="space-y-1 flex-1">
                            <h4 className="text-sm font-medium text-slate-300">Location</h4>
                            <p className="text-sm text-white font-medium">{propertyDetails.location.street}</p>
                            <p className="text-xs text-slate-500">
                                {propertyDetails.location.ward}, {propertyDetails.location.city} {propertyDetails.location.zipCode && `(${propertyDetails.location.zipCode})`}
                            </p>
                        </div>
                    </div>

                    <Separator className="bg-slate-800"/>

                    <div className="flex items-start gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-1">
                            <Building2 size={18}/>
                        </div>
                        <div className="space-y-3 flex-1">
                            <h4 className="text-sm font-medium text-slate-300">Attributes</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div>
                                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Type</span>
                                    <div className="mt-0.5">
                                        <Badge variant="outline"
                                               className="border-slate-700 text-slate-300 text-[10px] h-5">
                                            {propertyDetails.attributes.constructionType.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <span
                                        className="text-[10px] uppercase text-slate-500 tracking-wider">Occupancy</span>
                                    <div className="mt-0.5">
                                        <Badge variant="outline"
                                               className="border-slate-700 text-slate-300 text-[10px] h-5">
                                            {propertyDetails.attributes.occupancyType}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <span
                                        className="text-[10px] uppercase text-slate-500 tracking-wider">Year built</span>
                                    <p className="text-sm text-slate-300">{propertyDetails.attributes.yearBuilt}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Floors</span>
                                    <p className="text-sm text-slate-300">{propertyDetails.attributes.noFloors}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-800"/>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400 mt-1">
                                <Ruler size={18}/>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-300">Area</h4>
                                <p className="text-sm font-medium text-white">{propertyDetails.attributes.squareMeters} m²</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400 mt-1">
                                <Wallet size={18}/>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-300">Est. cost</h4>
                                <p className="text-sm font-medium text-white">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(propertyDetails.valuation.estimatedConstructionCost)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-slate-500 italic text-sm">
                Property details not found or invalid format.
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#141124] border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Lead details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div
                        className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <div className="space-y-1">
                            <Label className="text-slate-500 text-[10px] uppercase tracking-wider">Lead ID</Label>
                            <div className="font-mono text-sm font-medium text-white">#{lead.id}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <Label className="text-slate-500 text-[10px] uppercase tracking-wider">Status</Label>
                            <div>
                                <Badge variant="secondary"
                                       className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">
                                    {lead.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-400 text-xs uppercase tracking-wider">User info</Label>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300">
                            {userDetails ? (
                                <div className="space-y-1">
                                    <div
                                        className="font-medium text-slate-200">{userDetails.firstName} {userDetails.lastName}</div>
                                    <div className="text-xs text-slate-500">{userDetails.email}</div>
                                </div>
                            ) : (
                                lead.userInfo
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-400 text-xs uppercase tracking-wider">Property info</Label>
                        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                            {renderPropertyContent()}
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