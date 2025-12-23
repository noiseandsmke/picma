import React, {useEffect, useState} from 'react';
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {fetchPropertyById, PropertyInfoDto} from '../services/propertyService';
import {fetchUserById, UserDto} from '../services/userService';
import {Skeleton} from '@/components/ui/skeleton';
import {Building2, Calendar, FileText, Hammer, Home, Layers, MapPin, Ruler, Wallet} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {PropertyLeadDto} from '../services/leadService';

interface LeadDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: PropertyLeadDto | null;
    hideUserInfo?: boolean;
}

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

export const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({open, onOpenChange, lead, hideUserInfo}) => {
    const [propertyDetails, setPropertyDetails] = useState<PropertyInfoDto | null>(null);
    const [userDetails, setUserDetails] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLegacy, setIsLegacy] = useState(false);


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
                    <Skeleton className="h-4 w-3/4 bg-muted"/>
                    <Skeleton className="h-4 w-1/2 bg-muted"/>
                    <Skeleton className="h-24 w-full bg-muted"/>
                </div>
            );
        }

        if (isLegacy && legacyDetails) {
            return (
                <div className="space-y-2 text-sm text-text-muted italic">
                    Legacy data format: {JSON.stringify(legacyDetails)}
                </div>
            );
        }

        if (propertyDetails) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-border-main">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <MapPin className="h-4 w-4"/>
                        </div>
                        <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Property
                            Location</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                readOnly
                                value={propertyDetails.location.city}
                                className="bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Zip Code</Label>
                            <Input
                                readOnly
                                value={lead.zipCode || 'N/A'}
                                className="bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ward</Label>
                            <Input
                                readOnly
                                value={propertyDetails.location.ward}
                                className="bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>Street / House number</Label>
                            <div className="relative">
                                <Home className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/>
                                <Input
                                    readOnly
                                    value={propertyDetails.location.street}
                                    className="pl-9 bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                                />
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center gap-3 pb-2 border-b border-border-main pt-2">
                        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                            <Building2 className="h-4 w-4"/>
                        </div>
                        <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Property
                            Attributes</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Construction type</Label>
                            <div className="relative">
                                <Hammer
                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted z-10 pointer-events-none"/>
                                <Input
                                    readOnly
                                    value={formatEnum(propertyDetails.attributes.constructionType)}
                                    className="pl-9 bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Year built</Label>
                            <div className="relative">
                                <Calendar
                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                                <Input
                                    readOnly
                                    value={propertyDetails.attributes.yearBuilt}
                                    className="pl-9 bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>No. floors</Label>
                            <div className="relative">
                                <Layers
                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                                <Input
                                    readOnly
                                    value={propertyDetails.attributes.noFloors}
                                    className="pl-9 bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Square meters</Label>
                            <div className="relative">
                                <Ruler
                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                                <Input
                                    readOnly
                                    value={`${propertyDetails.attributes.squareMeters} m²`}
                                    className="pl-9 bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>Est. cost</Label>
                            <div className="relative">
                                <Wallet
                                    className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                                <Input
                                    readOnly
                                    value={new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(propertyDetails.valuation.estimatedConstructionCost)}
                                    className="pl-9 bg-input-bg border-input-border text-text-muted focus-visible:ring-0 cursor-default"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-text-muted italic text-sm">
                Property details not found or invalid format.
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] bg-surface-main border-border-main text-text-main h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b border-border-main">
                    <DialogTitle className="text-text-main text-lg">Lead Details</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

                    <div
                        className="flex items-center justify-between bg-muted p-4 rounded-lg border border-border-main">
                        <div className="space-y-1">
                            <Label className="text-text-muted text-[10px] uppercase tracking-wider">Lead ID</Label>
                            <div className="font-mono text-sm font-medium text-text-main">#{lead.id}</div>
                        </div>
                        <div className="text-right space-y-1">
                            <Label className="text-text-muted text-[10px] uppercase tracking-wider">Status</Label>
                            <div>
                                <Badge variant="secondary"
                                       className="bg-primary/10 text-primary hover:bg-primary/20 pointer-events-none">
                                    {lead.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {!hideUserInfo && (
                        <>
                            <div className="flex items-center gap-3 pb-2 border-b border-border-main">
                                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                    <FileText className="h-4 w-4"/>
                                </div>
                                <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">User
                                    Summary</h4>
                            </div>

                            <div className="p-4 rounded-lg bg-muted border border-border-main">
                                {userDetails ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-text-muted text-xs">Name</Label>
                                            <div
                                                className="text-sm font-medium text-text-secondary">{userDetails.firstName} {userDetails.lastName}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-text-muted text-xs">Email</Label>
                                            <div
                                                className="text-sm text-text-secondary break-all">{userDetails.email}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-text-muted italic">
                                        {lead.userInfo || "No user info available"}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {renderPropertyContent()}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border-main">
                    <DialogClose asChild>
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};