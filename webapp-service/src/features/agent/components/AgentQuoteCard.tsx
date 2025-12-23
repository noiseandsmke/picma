import React, {useState} from 'react';
import {PropertyQuoteDto} from '@/features/admin/services/quoteService';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ArrowUpRight, Calendar, FileText, MapPin} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';

interface AgentQuoteCardProps {
    quote: PropertyQuoteDto;
    propertyAddress?: React.ReactNode;
    onViewDetail: (quote: PropertyQuoteDto) => Promise<void> | void;
}

export const AgentQuoteCard: React.FC<AgentQuoteCardProps> = ({quote, propertyAddress, onViewDetail}) => {
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
        <div
            className="bg-surface-main border border-border-main rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300 group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                    className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6"/>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="font-bold text-text-main truncate">#{quote.id.toString().padStart(6, '0')}</span>
                        <Badge variant="outline"
                               className="text-[10px] py-0 border-primary/20 bg-primary/5 text-primary">
                            {quote.status}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <MapPin className="w-3.5 h-3.5 shrink-0"/>
                            <span className="truncate max-w-[200px]">{propertyAddress || quote.leadId}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5"/>
                            <span>{new Date(quote.createdDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                    <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider">Total Premium</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(quote.premium?.total || 0)}</p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary hover:text-white transition-colors border border-border-main"
                    onClick={handleClick}
                    disabled={isLoading}
                >
                    {isLoading ? <span className="animate-spin text-sm">...</span> :
                        <ArrowUpRight className="w-4 h-4"/>}
                </Button>
            </div>
        </div>
    );
};