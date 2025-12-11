import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {QuoteForm} from '@/features/admin/components/QuoteForm';
import {PropertyQuoteDto} from '@/features/admin/services/quoteService';
import {LeadDto} from '@/features/admin/services/leadService';
import {CheckCircle, XCircle} from 'lucide-react';

interface OwnerQuoteDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quote: PropertyQuoteDto | null;
    lead: LeadDto;
    onAccept: (quoteId: number) => void;
    onReject: (quoteId: number) => void;
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
    if (!quote) return null;

    const canAct = quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Quote Details #{quote.id}</DialogTitle>
                </DialogHeader>

                <div className="pointer-events-none">
                    <QuoteForm
                        initialData={quote}
                        onSubmit={() => {
                        }}
                        onCancel={() => {
                        }}
                        leads={[lead]}
                        hideLeadInfo={true}
                        agentId={quote.agentId}
                        readOnly={true}
                    />
                </div>

                <DialogFooter className="gap-2 sm:justify-between border-t border-slate-800 pt-4 mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {canAct && (
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => onReject(quote.id)}
                                disabled={isPendingAction}
                                className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                            >
                                <XCircle className="w-4 h-4 mr-2"/>
                                Reject Quote
                            </Button>
                            <Button
                                onClick={() => onAccept(quote.id)}
                                disabled={isPendingAction}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2"/>
                                Accept Quote
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};