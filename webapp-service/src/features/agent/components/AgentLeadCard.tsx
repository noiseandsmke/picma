import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { cn } from "@/lib/utils.ts";
import { Eye, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { fetchPropertyById } from '@/features/admin/services/propertyService.ts';
import { AgentLeadDto } from '../services/agentService';

interface AgentLeadCardProps {
    lead: AgentLeadDto;
    onViewDetail: (lead: AgentLeadDto) => void;
    isLoadingAction?: boolean;
    quoteStatus?: 'NEW' | 'ACCEPTED' | 'REJECTED';
}

export const AgentLeadCard: React.FC<AgentLeadCardProps> = ({ lead, onViewDetail, isLoadingAction, quoteStatus }) => {
    const { data: property, isLoading } = useQuery({
        queryKey: ['property-details', lead.propertyInfo],
        queryFn: () => {
            if (lead.propertyInfo.startsWith('{')) {
                try {
                    return Promise.resolve(JSON.parse(lead.propertyInfo));
                } catch {
                    return Promise.resolve(null);
                }
            }
            return fetchPropertyById(lead.propertyInfo);
        },
        staleTime: 1000 * 60 * 5,
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/30 transition-all duration-300 group">

            <div className="flex-shrink-0 w-24">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Lead ID</p>
                <div className="text-slate-300 font-mono font-medium">#{lead.id}</div>
                <div className="text-xs text-slate-500 mt-1">
                    {new Date(lead.createDate).toLocaleDateString()}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48 bg-slate-800" />
                        <Skeleton className="h-4 w-32 bg-slate-800" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="font-bold text-white truncate" title={`${property?.location?.street}, ${property?.location?.ward}`}>
                                {property?.location?.street || `Property #${lead.propertyInfo}`}{property?.location?.ward ? `, ${property.location.ward}` : ''}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-400 pl-6">
                            {property?.location?.city || 'Unknown City'}{property?.location?.zipCode ? `, ${property.location.zipCode}` : ''}
                        </p>
                    </>
                )}
            </div>

            <div className="flex-shrink-0 flex items-center justify-center px-4">
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-32 transition-all bg-slate-800 hover:bg-slate-700 text-slate-300"
                    onClick={() => onViewDetail(lead)}
                    disabled={isLoadingAction}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                </Button>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3 w-24 justify-end">
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border transition-colors",
                    quoteStatus === 'ACCEPTED'
                        ? "bg-green-500/10 border-green-500/50 text-green-500"
                        : "bg-slate-950 border-slate-800 text-slate-700 opacity-50"
                )} title="Accepted">
                    <CheckCircle className="h-5 w-5" />
                </div>
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border transition-colors",
                    quoteStatus === 'REJECTED'
                        ? "bg-red-500/10 border-red-500/50 text-red-500"
                        : "bg-slate-950 border-slate-800 text-slate-700 opacity-50"
                )} title="Rejected">
                    <XCircle className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};