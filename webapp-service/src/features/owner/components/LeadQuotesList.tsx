import React, {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchAllQuotes} from '@/features/admin/services/quoteService';
import {formatCurrency} from '@/lib/utils';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {FileText} from 'lucide-react';

interface LeadQuotesListProps {
    leadId: number;
}

export const LeadQuotesList: React.FC<LeadQuotesListProps> = ({leadId}) => {
    const {data: quotes, isLoading} = useQuery({
        queryKey: ['quotes'],
        queryFn: () => fetchAllQuotes(),
    });

    const leadQuotes = useMemo(() => {
        return quotes?.filter(q => q.leadId === leadId) || [];
    }, [quotes, leadId]);

    if (isLoading) {
        return <Skeleton className="h-10 w-full bg-slate-800"/>;
    }

    if (leadQuotes.length === 0) {
        return (
            <div className="text-sm text-slate-500 py-2 italic text-center border-t border-slate-800">
                No quotes received yet.
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full border-t border-slate-800">
            <AccordionItem value="quotes" className="border-b-0">
                <AccordionTrigger className="text-sm py-3 px-1 hover:no-underline text-slate-300 hover:text-white">
                    <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-indigo-400"/>
                        <span>View Received Quotes ({leadQuotes.length})</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-3 pt-1 pb-2">
                        {leadQuotes.map((quote) => (
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
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};