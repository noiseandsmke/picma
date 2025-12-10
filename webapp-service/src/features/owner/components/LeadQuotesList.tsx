import React from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {acceptQuote, fetchQuotesByLeadId, rejectQuote} from '@/features/admin/services/quoteService';
import {formatCurrency} from '@/lib/utils';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {CheckCircle, FileText, XCircle} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";

interface LeadQuotesListProps {
    leadId: number;
    leadStatus: string;
}

export const LeadQuotesList: React.FC<LeadQuotesListProps> = ({leadId, leadStatus}) => {
    const queryClient = useQueryClient();
    const [actionId, setActionId] = React.useState<{ id: number, type: 'accept' | 'reject' } | null>(null);

    const {data: quotes, isLoading} = useQuery({
        queryKey: ['quotes', leadId],
        queryFn: () => fetchQuotesByLeadId(leadId),
    });

    const acceptMutation = useMutation({
        mutationFn: acceptQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['quotes']});
            await queryClient.invalidateQueries({queryKey: ['owner-leads']});
            toast.success("Quote accepted successfully");
            setActionId(null);
        },
        onError: () => toast.error("Failed to accept quote")
    });

    const rejectMutation = useMutation({
        mutationFn: rejectQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['quotes']});
            toast.success("Quote rejected successfully");
            setActionId(null);
        },
        onError: () => toast.error("Failed to reject quote")
    });

    const handleAction = () => {
        if (!actionId) return;
        if (actionId.type === 'accept') {
            acceptMutation.mutate(actionId.id);
        } else {
            rejectMutation.mutate(actionId.id);
        }
    };

    if (isLoading) {
        return <Skeleton className="h-10 w-full bg-slate-800"/>;
    }

    if (!quotes || quotes.length === 0) {
        return (
            <div className="text-sm text-slate-500 py-2 italic text-center border-t border-slate-800">
                No quotes received yet.
            </div>
        );
    }

    const canAct = leadStatus === 'IN_REVIEWING';

    return (
        <>
            <Accordion type="single" collapsible className="w-full border-t border-slate-800">
                <AccordionItem value="quotes" className="border-b-0">
                    <AccordionTrigger className="text-sm py-3 px-1 hover:no-underline text-slate-300 hover:text-white">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-indigo-400"/>
                            <span>View Received Quotes ({quotes.length})</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-1 pb-2">
                            {quotes.map((quote) => (
                                <div key={quote.id}
                                     className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{quote.agentName}</span>
                                            <span className="text-xs text-slate-500">
                                            Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                                        </span>
                                        </div>
                                        <Badge variant="outline"
                                               className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                            {formatCurrency(quote.premium.total)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Plan: {quote.plan}</span>
                                        <span>Status: {quote.status || 'PENDING'}</span>
                                    </div>

                                    {canAct && quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED' && (
                                        <div className="flex justify-end gap-2 mt-2 border-t border-slate-800/50 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                                                onClick={() => setActionId({id: quote.id, type: 'reject'})}
                                                disabled={rejectMutation.isPending || acceptMutation.isPending}
                                            >
                                                <XCircle className="w-3 h-3 mr-1"/>
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => setActionId({id: quote.id, type: 'accept'})}
                                                disabled={rejectMutation.isPending || acceptMutation.isPending}
                                            >
                                                <CheckCircle className="w-3 h-3 mr-1"/>
                                                Accept
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <ConfirmDialog
                open={actionId !== null}
                onOpenChange={(open) => !open && setActionId(null)}
                title={actionId?.type === 'accept' ? "Accept Quote" : "Reject Quote"}
                description={actionId?.type === 'accept'
                    ? "Are you sure you want to accept this quote? This will officially select this insurance policy."
                    : "Are you sure you want to reject this quote?"}
                onConfirm={handleAction}
                confirmText={actionId?.type === 'accept' ? "Accept" : "Reject"}
                variant={actionId?.type === 'accept' ? "default" : "destructive"}
            />
        </>
    );
};