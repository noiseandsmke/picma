import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { cn } from "@/lib/utils.ts";
import { Eye, MapPin } from 'lucide-react';
import { fetchPropertyById } from '@/features/admin/services/propertyService.ts';
import { AgentLeadDto } from '../services/agentService';

interface AgentLeadCardProps {
    lead: AgentLeadDto;
    onViewDetail: (lead: AgentLeadDto) => void;
    isLoadingAction?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    'INTERESTED': { label: 'Prospect', className: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' },
    'ACCEPTED': { label: 'Policy Active', className: 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' },
    'REJECTED': { label: 'Rejected', className: 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border-red-900/50' },
    'NEW': { label: 'New Lead', className: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' }
};

export const AgentLeadCard: React.FC<AgentLeadCardProps> = ({ lead, onViewDetail, isLoadingAction }) => {
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

    const status = lead.leadAction || 'NEW';
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['NEW'];

    return (
        <Card
            className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-[#141124] h-full flex flex-col">
            <div className="h-40 bg-slate-800 relative overflow-hidden group shrink-0">
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <MapPin className="h-10 w-10 opacity-50" />
                </div>

                <div className="absolute top-3 right-3">
                    <Badge variant="outline"
                        className={cn("border-0 font-medium backdrop-blur-sm shadow-sm", config.className)}>
                        {config.label}
                    </Badge>
                </div>

                <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
                        onClick={() => onViewDetail(lead)}
                        disabled={isLoadingAction}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {status === 'NEW' ? 'Interested & View' : 'View Details'}
                    </Button>
                </div>
            </div>
            <CardContent className="p-4 flex-1">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4 bg-slate-800" />
                        <Skeleton className="h-4 w-1/2 bg-slate-800" />
                    </div>
                ) : (
                    <>
                        <h3 className="font-bold text-base text-white line-clamp-1"
                            title={property?.location?.street}>
                            {property?.location?.street || `Property #${lead.propertyInfo}`}
                        </h3>
                        <div className="flex items-center text-slate-400 text-xs mt-1 mb-3">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property?.location?.city || 'Unknown City'}, {property?.location?.zipCode || ''}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Type</p>
                                <p className="font-medium text-slate-300 truncate">
                                    {property?.attributes?.constructionType
                                        ? property.attributes.constructionType.replace('_', ' ')
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Client</p>
                                <p className="font-medium text-slate-300 truncate">
                                    {lead.userInfo === 'HIDDEN' ? 'Anonymous' : (lead.userInfo.split(' ')[0] || 'Client')}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className="p-3 border-t border-slate-800/50 bg-slate-900/20">
                <div className="w-full text-xs text-center text-slate-500">
                    Lead ID: #{lead.leadId} • {new Date(lead.createdAt).toLocaleDateString()}
                </div>
            </CardFooter>
        </Card>
    );
};