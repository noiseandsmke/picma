import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, ShieldCheck, User, XCircle } from 'lucide-react';
import { PropertyQuoteDto, fetchQuoteById } from '@/features/admin/services/quoteService';
import { LeadDto } from '@/features/admin/services/leadService';
import { CoverageDetailCard } from '@/components/ui/coverage-detail-card';
import { formatCurrency, getUserInitials } from '@/lib/utils';
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
    quote: initialQuote,
    onAccept,
    onReject,
    isPendingAction
}) => {
    const { data: quote } = useQuery({
        queryKey: ['quote-detail', initialQuote?.id],
        queryFn: () => initialQuote ? fetchQuoteById(initialQuote.id) : Promise.reject(new Error('No quote')),
        initialData: initialQuote,
        enabled: !!initialQuote?.id
    });

    const { data: agent, isLoading: isAgentLoading } = useQuery({
        queryKey: ['agent-detail', quote?.agentId],
        queryFn: () => quote ? fetchUserById(quote.agentId) : Promise.reject(new Error('No quote')),
        enabled: !!quote?.agentId
    });

    if (!quote) return null;

    const isActionable = quote.status === 'NEW';

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
                                    Quote #{quote.id}
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
                        </div>

                        <div className="space-y-6">
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
                                            {getUserInitials(agent?.firstName || 'Agent', agent?.lastName)}
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

                    <div className="mt-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                             <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Formula Explanation & Premium Breakdown
                            </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                            <div className="lg:col-span-2 p-6 space-y-4">
                                <div className="space-y-4 text-xs text-slate-400">
                                    {quote.coverages.map(c => {
                                        let rate = 0;
                                        if (c.code === 'FIRE') rate = 0.02;
                                        else if (c.code === 'THEFT') rate = 0.015;
                                        else if (c.code === 'NATURAL_DISASTER') rate = 0.025;
                                        
                                        const basePremium = c.limit * rate;
                                        const discountFactor = Math.exp(-5 * c.deductible);
                                        const finalPremium = basePremium * discountFactor;

                                        return (
                                            <div key={c.code} className="border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                                                <div className="flex justify-between font-bold text-slate-200 mb-1">
                                                    <span>{c.code.replace('_', ' ')}</span>
                                                    <span>{(rate * 100).toFixed(1)}% Base Rate</span>
                                                </div>
                                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                                    <span>Base Premium ({formatCurrency(c.limit)} × {rate})</span>
                                                    <span className="font-mono">{formatCurrency(basePremium)}</span>
                                                </div>
                                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-emerald-400">
                                                    <span>Discount (Deductible {(c.deductible * 100).toFixed(1)}%)</span>
                                                    <span className="font-mono">× {discountFactor.toFixed(4)}</span>
                                                </div>
                                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center font-bold text-white mt-1 pt-1 border-t border-slate-800/30">
                                                    <span>Coverage Premium</span>
                                                    <span className="font-mono">{formatCurrency(finalPremium)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-6 flex flex-col justify-center relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                
                                <div className="space-y-4 relative z-10">
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
                                        <span className="text-2xl font-bold text-emerald-400">{formatCurrency(quote.premium.total)}</span>
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