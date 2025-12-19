import React, { useState } from 'react';
import { PropertyQuoteDto } from '@/features/admin/services/quoteService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AgentQuoteCardProps {
    quote: PropertyQuoteDto;
    propertyAddress?: React.ReactNode;
    onViewDetail: (quote: PropertyQuoteDto) => void;
}

export const AgentQuoteCard: React.FC<AgentQuoteCardProps> = ({ quote, propertyAddress, onViewDetail }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            await onViewDetail(quote);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300 group">

            <div className="flex-shrink-0 w-24">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Quote ID</p>
                <div className="text-slate-300 font-mono font-medium">#{quote.id}</div>
                <div className="text-xs text-slate-500 mt-1">
                    {new Date(quote.createdDate).toLocaleDateString()}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-bold text-white truncate">
                        {propertyAddress || 'Address unavailable'}
                    </h3>
                </div>
                <div className="pl-6 mt-1 flex gap-2 items-center">
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 h-5">
                       Limit: {formatCurrency(quote.coverages.find(c => c.code === 'FIRE')?.limit || 0)}
                    </Badge>
                     <p className="text-xs text-slate-500 ml-2">
                        Premium: <span className="text-emerald-400 font-medium">{formatCurrency(quote.premium.total)}</span>
                    </p>
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center justify-end gap-3 w-24 mr-4">
                 {quote.status === 'ACCEPTED' && (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-green-500/10 border-green-500/50 text-green-500" title="Accepted">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                )}
                 {quote.status === 'REJECTED' && (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-red-500/10 border-red-500/50 text-red-500" title="Rejected">
                        <XCircle className="h-5 w-5" />
                    </div>
                )}
                 {quote.status === 'NEW' && (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-blue-500/10 border-blue-500/50 text-blue-500" title="New / Pending">
                        <Clock className="h-5 w-5" />
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 flex items-center justify-center px-4">
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-32 transition-all bg-slate-800 hover:bg-slate-700 text-slate-300"
                    onClick={handleClick}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    {quote.status === 'NEW' ? 'Edit' : 'View'}
                </Button>
            </div>
        </div>
    );
};
