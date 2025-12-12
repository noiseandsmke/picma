import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {CheckCircle, FileText, XCircle} from 'lucide-react';
import {PropertyQuoteDto} from '@/features/admin/services/quoteService';
import {LeadDto} from '@/features/admin/services/leadService';
import {QuoteForm} from '@/features/admin/components/QuoteForm';

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
    if (!quote) return null;

    const canAction = quote.status === 'PENDING';
    const isActionable = canAction && lead.status === 'IN_REVIEWING';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-400"/>
                        Insurance Quote Details
                    </DialogTitle>
                </DialogHeader>

                <div className="pointer-events-none opacity-100">
                    <QuoteForm
                        initialData={quote}
                        onSubmit={() => {
                        }} onCancel={() => {
                    }}
                        isLoading={false}
                        leads={[lead]}
                        hideAgentSelect={true}
                        agentId={quote.agentId}
                        readOnly={true}
                    />
                </div>

                <DialogFooter className="gap-2 sm:justify-between border-t border-slate-800 pt-4 mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {isActionable && (
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => onReject(quote.id)}
                                disabled={isPendingAction}
                                className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                            >
                                <XCircle className="mr-2 h-4 w-4"/>
                                Reject Quote
                            </Button>
                            <Button
                                onClick={() => onAccept(quote.id)}
                                disabled={isPendingAction}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle className="mr-2 h-4 w-4"/>
                                Accept Quote
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};