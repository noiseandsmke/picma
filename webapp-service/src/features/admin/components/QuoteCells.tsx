import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchLeadById} from '../services/leadService';
import {fetchUserById} from '../services/userService';
import {fetchPropertyById} from '../services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';
import {Building} from 'lucide-react';

interface LeadInfoCellProps {
    leadId: number;
}

export const LeadInfoCell: React.FC<LeadInfoCellProps> = ({leadId}) => {
    const {data: lead, isLoading} = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => fetchLeadById(leadId),
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) return <Skeleton className="h-4 w-24"/>;
    if (!lead) return <span className="text-slate-500">Unknown Lead ({leadId})</span>;

    return (
        <div className="flex flex-col">
            <span className="font-medium text-slate-200">{lead.userInfo}</span>
            <a href={`#`} className="text-xs text-indigo-400 hover:text-indigo-300">View Lead</a>
        </div>
    );
};

interface AgentInfoCellProps {
    agentId: string;
}

export const AgentInfoCell: React.FC<AgentInfoCellProps> = ({agentId}) => {
    const {data: agent, isLoading} = useQuery({
        queryKey: ['user', agentId],
        queryFn: () => fetchUserById(agentId),
        staleTime: 1000 * 60 * 5,
        enabled: !!agentId,
    });

    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full"/>;

    if (!agent) {
        return (
            <div className="flex items-center gap-2">
                <div
                    className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-500">?
                </div>
                <span className="text-slate-400 text-sm truncate max-w-[100px]">{agentId}</span>
            </div>
        )
    }

    const displayName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.username;
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-2" title={displayName}>
            <div
                className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold text-xs border border-indigo-500/30">
                {initial}
            </div>
            <span className="text-slate-200 text-sm truncate max-w-[120px]">{displayName}</span>
        </div>
    );
};

interface PropertyInfoCellProps {
    leadId: number;
}

export const PropertyInfoCell: React.FC<PropertyInfoCellProps> = ({leadId}) => {
    const {data: lead, isLoading: isLeadLoading} = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => fetchLeadById(leadId),
        staleTime: 1000 * 60 * 5,
    });

    const propertyId = lead?.propertyInfo;

    const {data: property, isLoading: isPropertyLoading} = useQuery({
        queryKey: ['property', propertyId],
        queryFn: () => fetchPropertyById(propertyId!),
        enabled: !!propertyId,
        staleTime: 1000 * 60 * 5,
    });

    if (isLeadLoading || (propertyId && isPropertyLoading)) {
        return <Skeleton className="h-4 w-32"/>;
    }

    if (!property) {
        return <span className="text-slate-500 italic">No property info</span>;
    }

    const location = property.location;
    const address = location ? `${location.fullAddress}, ${location.city}` : 'Unknown Address';

    return (
        <div className="flex items-start gap-2 max-w-[250px]" title={address}>
            <Building className="h-4 w-4 text-slate-500 mt-0.5 shrink-0"/>
            <span className="text-sm text-slate-300 truncate">{address}</span>
        </div>
    );
};