import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {AgentLeadDto} from '../services/agentService';
import {ArrowRight, Building2, FileText, MapPin, Ruler, User, Wallet, XCircle} from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import {fetchPropertyById} from '@/features/admin/services/propertyService';
import {fetchUserById} from '@/features/admin/services/userService';
import {Skeleton} from '@/components/ui/skeleton';

interface AgentActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: AgentLeadDto | null;
    onCreateQuote: (leadId: number) => void;
    onReject: (lead: AgentLeadDto) => void;
    isPending: boolean;
    hasQuote?: boolean;
}

export const AgentActionDialog: React.FC<AgentActionDialogProps> = ({
                                                                        open,
                                                                        onOpenChange,
                                                                        lead,
                                                                        onCreateQuote,
                                                                        onReject,
                                                                        isPending,
                                                                        hasQuote
                                                                    }) => {
    if (!lead) return null;

    const isRejected = lead.leadAction === 'REJECTED';
    const isAccepted = lead.leadAction === 'ACCEPTED' || hasQuote;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-[#141124] border-slate-800 text-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <div className="p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-white flex items-center gap-2">
                            Lead Opportunity #{lead.leadId}
                            {lead.leadAction === 'INTERESTED' && (
                                <span
                                    className="text-xs font-normal px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Interested</span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <ExpandedPropertyView lead={lead}/>
                </div>

                <DialogFooter className="p-6 bg-slate-900/50 border-t border-slate-800 gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">
                        Close
                    </Button>

                    {!isRejected && (
                        <div className="flex gap-2">
                            {!isAccepted && (
                                <Button
                                    variant="destructive"
                                    onClick={() => onReject(lead)}
                                    disabled={isPending}
                                    className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                                >
                                    <XCircle className="w-4 h-4 mr-2"/>
                                    Reject Lead
                                </Button>
                            )}

                            {isAccepted ? (
                                <Button
                                    onClick={() => onCreateQuote(lead.leadId)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <FileText className="w-4 h-4 mr-2"/>
                                    View/Edit Quote
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => onCreateQuote(lead.leadId)}
                                    disabled={isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Create Quote
                                    <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ExpandedPropertyView: React.FC<{ lead: AgentLeadDto }> = ({lead}) => {
    const {data: property, isLoading: isPropLoading} = useQuery({
        queryKey: ['property-detail-full', lead.propertyInfo],
        queryFn: () => {
            if (lead.propertyInfo.startsWith('{')) {
                return Promise.resolve(JSON.parse(lead.propertyInfo));
            }
            return fetchPropertyById(lead.propertyInfo);
        },
    });

    const {data: user} = useQuery({
        queryKey: ['user-detail', lead.userInfo],
        queryFn: () => {
            if (lead.userInfo === 'HIDDEN') return null;
            if (!lead.userInfo.includes(' ')) {
                return fetchUserById(lead.userInfo).catch(() => null);
            }
            return null;
        },
        enabled: lead.userInfo !== 'HIDDEN' && !lead.userInfo.includes(' ')
    });

    if (isPropLoading) return <Skeleton className="h-48 w-full bg-slate-800"/>;

    if (!property) return <div className="text-slate-500">Property details unavailable.</div>;

    const displayUser = user ? `${user.firstName} ${user.lastName}` : (lead.userInfo === 'HIDDEN' ? 'Anonymous' : lead.userInfo);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Client Info</h3>
                    <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div
                            className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <User size={20}/>
                        </div>
                        <div>
                            <div className="font-medium text-white">{displayUser}</div>
                            <div className="text-xs text-slate-500">{user?.email || 'Contact info hidden'}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Location</h3>
                    <div className="flex items-start gap-3">
                        <MapPin className="text-indigo-400 mt-1" size={18}/>
                        <div>
                            <div className="font-medium text-white text-lg">{property.location?.street}</div>
                            <div className="text-slate-400">{property.location?.ward}, {property.location?.city}</div>
                            <div className="text-slate-500 text-sm mt-1">Zip: {property.location?.zipCode}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Property
                        Details</h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">Type</div>
                            <div className="font-medium text-slate-200 flex items-center gap-2">
                                <Building2 size={14} className="text-emerald-400"/>
                                {property.attributes?.constructionType?.replace('_', ' ') || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">Occupancy</div>
                            <div className="font-medium text-slate-200">
                                {property.attributes?.occupancyType || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">Area</div>
                            <div className="font-medium text-slate-200 flex items-center gap-2">
                                <Ruler size={14} className="text-amber-400"/>
                                {property.attributes?.squareMeters} m²
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">Year Built</div>
                            <div className="font-medium text-slate-200">
                                {property.attributes?.yearBuilt}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Valuation</h3>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div
                            className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Wallet size={20}/>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Estimated Construction Cost</div>
                            <div className="text-xl font-bold text-emerald-400">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(property.valuation?.estimatedConstructionCost || 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};