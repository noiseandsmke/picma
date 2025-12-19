import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AgentLeadDto } from '../services/agentService';
import { ArrowRight, Building2, FileText, MapPin, Ruler, User, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyById } from '@/features/admin/services/propertyService';
import { fetchUserById } from '@/features/admin/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: AgentLeadDto | null;
    quoteStatus?: 'NEW' | 'ACCEPTED' | 'REJECTED';
    onCreateQuote: (leadId: number) => void;
}

export const AgentActionDialog: React.FC<AgentActionDialogProps> = ({
    open,
    onOpenChange,
    lead,
    quoteStatus,
    onCreateQuote
}) => {
    if (!lead) return null;

    const hasQuote = !!quoteStatus;
    const isAccepted = quoteStatus === 'ACCEPTED';
    const isRejected = quoteStatus === 'REJECTED';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-slate-900 border-slate-800 text-slate-200 max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <div className="p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-white flex items-center gap-2">
                            Lead Opportunity #{lead.id}
                        </DialogTitle>
                    </DialogHeader>

                    <ExpandedPropertyView lead={lead} />
                </div>

                <DialogFooter className="p-6 bg-slate-950/50 border-t border-slate-800 gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">
                        Close
                    </Button>

                    <div className="flex gap-2">
                        {hasQuote ? (
                            <Button
                                onClick={() => onCreateQuote(lead.id)}
                                className="bg-primary hover:bg-primary-hover text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                {isAccepted || isRejected ? 'View Quote' : 'Edit Quote'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => onCreateQuote(lead.id)}
                                className="bg-primary hover:bg-primary-hover text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]"
                            >
                                Create Quote
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ExpandedPropertyView: React.FC<{ lead: AgentLeadDto }> = ({ lead }) => {
    const { data: property, isLoading: isPropLoading } = useQuery({
        queryKey: ['property-detail-full', lead.propertyInfo],
        queryFn: () => {
            if (lead.propertyInfo.startsWith('{')) {
                return Promise.resolve(JSON.parse(lead.propertyInfo));
            }
            return fetchPropertyById(lead.propertyInfo);
        },
    });

    const { data: user } = useQuery({
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

    if (isPropLoading) return <Skeleton className="h-48 w-full bg-slate-800" />;

    if (!property) return <div className="text-slate-500">Property details unavailable.</div>;

    let displayUser = lead.userInfo;
    if (user) {
        displayUser = `${user.firstName} ${user.lastName}`;
    } else if (lead.userInfo === 'HIDDEN') {
        displayUser = 'Anonymous';
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Client Info</h3>
                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-700/50">
                        <div
                            className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <User size={20} />
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
                        <MapPin className="text-primary mt-1" size={18} />
                        <div>
                            <div className="font-medium text-white text-lg">{property.location?.street}</div>
                            <div className="text-slate-400">{property.location?.ward}, {property.location?.city}</div>
                            <div className="text-slate-500 text-sm mt-1">Zip: {lead.zipCode}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Property
                        Details</h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">Type</div>
                            <div className="font-medium text-slate-200 flex items-center gap-2">
                                <Building2 size={14} className="text-primary" />
                                {property.attributes?.constructionType?.replace('_', ' ') || 'N/A'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-slate-500">Area</div>
                            <div className="font-medium text-slate-200 flex items-center gap-2">
                                <Ruler size={14} className="text-amber-400" />
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
                    <div className="flex items-center gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                        <div
                            className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Estimated Construction Cost</div>
                            <div className="text-xl font-bold text-primary">
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