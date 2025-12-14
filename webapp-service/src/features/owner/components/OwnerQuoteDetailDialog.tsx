import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, ShieldCheck, User, XCircle } from 'lucide-react';
import { PropertyQuoteDto } from '@/features/admin/services/quoteService';
import { LeadDto } from '@/features/admin/services/leadService';
import { CoverageDetailCard } from '@/components/ui/coverage-detail-card';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '@/features/admin/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

interface OwnerQuoteDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quote: PropertyQuoteDto | null;
    lead: LeadDto;
    onAccept: (id: number) => void;
    onReject: (id: number) => void;
    isPendingAction: boolean;
}

export const OwnerQuoteDetailDialog: React.FC<OwnerQuoteDetailDialogProps> = ({
    open,
    onOpenChange,
    quote,
    lead,
    onAccept,
    onReject,
    isPendingAction
}) => {
    const { data: agent, isLoading: isAgentLoading } = useQuery({
        queryKey: ['agent-detail', quote?.agentId],
        queryFn: () => quote ? fetchUserById(quote.agentId) : Promise.reject(new Error('No quote')),
        enabled: !!quote?.agentId
    });

    if (!quote) return null;

    const canAction = quote.status === 'PENDING';
    const isActionable = canAction && lead.status === 'IN_REVIEWING';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center gap-2">
                            <div
                                className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Insurance Quote Details</h3>
                                <p className="text-sm font-normal text-slate-400">
                                    Quote #{quote.id} • Valid until {new Date(quote.validUntil).toLocaleDateString()}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Selected Coverages
                                </h4>
                                <div className="space-y-3">
                                    {quote.coverages.map((coverage) => (
                                        <CoverageDetailCard
                                            key={coverage.code}
                                            coverage={coverage}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Policy
                                    Summary</h4>
                                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                    <span className="text-slate-300">Total Sum Insured</span>
                                    <span
                                        className="font-mono text-lg font-medium text-white">{formatCurrency(quote.sumInsured)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-300">Start Date</span>
                                    <span className="text-white">{new Date(quote.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-300">End Date</span>
                                    <span className="text-white">{new Date(quote.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div
                                className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Premium
                                    Breakdown</h4>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Net Premium</span>
                                        <span className="text-slate-200">{formatCurrency(quote.premium.net)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Tax (VAT 10%)</span>
                                        <span className="text-slate-200">{formatCurrency(quote.premium.tax)}</span>
                                    </div>
                                    <div className="h-px bg-slate-700 my-2" />
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-300 font-medium">Total Premium</span>
                                        <span
                                            className="text-xl font-bold text-emerald-400">{formatCurrency(quote.premium.total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Agent Information
                                </h4>
                                <div
                                    className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                                    {isAgentLoading ? (
                                        <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
                                    ) : (
                                        <div
                                            className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                                            {agent?.firstName?.charAt(0) || 'A'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium text-white">
                                            {isAgentLoading ? <Skeleton
                                                className="h-4 w-32 bg-slate-800" /> : `${agent?.firstName} ${agent?.lastName}`}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {isAgentLoading ?
                                                <Skeleton className="h-3 w-24 bg-slate-800 mt-1" /> : agent?.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-950/50 border-t border-slate-800 gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}
                        className="text-slate-400 hover:text-white">
                        Close
                    </Button>
                    {isActionable && (
                        <div className="flex gap-3">
                            <Button
                                variant="destructive"
                                onClick={() => onReject(quote.id)}
                                disabled={isPendingAction}
                                className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Quote
                            </Button>
                            <Button
                                onClick={() => onAccept(quote.id)}
                                disabled={isPendingAction}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accept Quote
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};