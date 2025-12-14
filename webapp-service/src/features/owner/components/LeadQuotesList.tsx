import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acceptQuote, fetchQuotesByLeadId, PropertyQuoteDto, rejectQuote } from '@/features/admin/services/quoteService';
import { formatCurrency } from '@/lib/utils';
import { fetchUserById } from '@/features/admin/services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OwnerQuoteDetailDialog } from './OwnerQuoteDetailDialog';
import { LeadDto } from '@/features/admin/services/leadService';

interface LeadQuotesListProps {
    leadId: number;
    leadStatus: string;
}

export const LeadQuotesList: React.FC<LeadQuotesListProps> = ({ leadId, leadStatus }) => {
    const queryClient = useQueryClient();
    const [actionId, setActionId] = React.useState<{ id: number, type: 'accept' | 'reject' } | null>(null);
    const [selectedQuote, setSelectedQuote] = React.useState<PropertyQuoteDto | null>(null);

    const { data: quotes, isLoading } = useQuery({
        queryKey: ['quotes', leadId],
        queryFn: () => fetchQuotesByLeadId(leadId),
    });

    const acceptMutation = useMutation({
        mutationFn: acceptQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['quotes'] });
            await queryClient.invalidateQueries({ queryKey: ['owner-leads'] });
            toast.success("Quote accepted successfully");
            setActionId(null);
            setSelectedQuote(null);
        },
        onError: () => toast.error("Failed to accept quote")
    });

    const rejectMutation = useMutation({
        mutationFn: rejectQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['quotes'] });
            toast.success("Quote rejected successfully");
            setActionId(null);
            setSelectedQuote(null);
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

    const handleActionFromDetail = (quoteId: number, type: 'accept' | 'reject') => {
        setActionId({ id: quoteId, type });
        // We close the detail dialog first, then confirm dialog opens
        setSelectedQuote(null);
    };

    if (isLoading) {
        return <Skeleton className="h-10 w-full bg-slate-800" />;
    }

    if (!quotes || quotes.length === 0) {
        return (
            <div className="text-sm text-slate-500 py-2 italic text-center border-t border-slate-800">
                No quotes received yet.
            </div>
        );
    }

    const pendingQuotes = quotes.filter(q => q.status !== 'ACCEPTED' && q.status !== 'REJECTED');

    // Create a minimal lead DTO for the form
    const leadDto: LeadDto = {
        id: leadId,
        userInfo: '', // Hidden anyway
        propertyInfo: '', // Not used for display in read-only form if disabled
        status: leadStatus,
        createDate: new Date().toISOString(),
        expiryDate: new Date().toISOString() // Dummy date to satisfy type
    };

    return (
        <>
            <Accordion type="single" collapsible className="w-full border-t border-slate-800">
                <AccordionItem value="quotes" className="border-b-0">
                    <AccordionTrigger className="text-sm py-3 px-1 hover:no-underline text-slate-300 hover:text-white">
                        <div className="flex items-center justify-between w-full pr-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-indigo-400" />
                                <span>View Received Quotes</span>
                            </div>
                            {pendingQuotes.length > 0 && (
                                <Badge variant="secondary"
                                    className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30">
                                    {pendingQuotes.length} Action Required
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-1 pb-2">
                            {quotes.map((quote) => (
                                <LeadQuoteItem key={quote.id} quote={quote} setSelectedQuote={setSelectedQuote} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <OwnerQuoteDetailDialog
                open={!!selectedQuote}
                onOpenChange={(open) => !open && setSelectedQuote(null)}
                quote={selectedQuote}
                lead={leadDto}
                onAccept={(id) => handleActionFromDetail(id, 'accept')}
                onReject={(id) => handleActionFromDetail(id, 'reject')}
                isPendingAction={acceptMutation.isPending || rejectMutation.isPending}
            />

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

const LeadQuoteItem = ({ quote, setSelectedQuote }: {
    quote: PropertyQuoteDto,
    setSelectedQuote: (quote: PropertyQuoteDto) => void
}) => {
    const { data: agent } = useQuery({
        queryKey: ['user', quote.agentId],
        queryFn: () => fetchUserById(quote.agentId),
        staleTime: 1000 * 60 * 5,
        enabled: !!quote.agentId,
    });

    const agentName = agent ? `${agent.firstName} ${agent.lastName}` : quote.agentId;

    return (
        <div key={quote.id}
            className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{agentName}</span>
                    <span className="text-xs text-slate-500">
                        Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                    </span>
                </div>
                <Badge variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {formatCurrency(quote.premium.total)}
                </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Plan: {quote.plan}</span>
                {/* Hide status text if PENDING, as per requirement */}
                {quote.status && quote.status !== 'PENDING' && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                        {quote.status}
                    </Badge>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-2 border-t border-slate-800/50 pt-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => setSelectedQuote(quote)}
                >
                    <FileText className="w-3 h-3 mr-1" />
                    View Details
                </Button>
            </div>
        </div>
    );
};