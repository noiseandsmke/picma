import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchLeadById} from '../services/leadService';
import {fetchUserById} from '../services/userService';
import {fetchPropertyById} from '../services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';
import {Badge} from '@/components/ui/badge';
import {Building, Copy} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {cn} from "@/lib/utils";

interface QuoteIdCellProps {
    id: number;
    dateStr?: string;
}

export const QuoteIdCell: React.FC<QuoteIdCellProps> = ({id, dateStr}) => {
    const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
    const formattedId = `Q-${year}-${id.toString().padStart(3, '0')}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedId)
            .then(() => toast.success("Quote ID copied to clipboard"))
            .catch((err) => console.error("Failed to copy", err));
    };

    return (
        <Button
            variant="ghost"
            className="font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 h-auto p-1 px-2"
            onClick={handleCopy}
            title="Click to copy"
        >
            {formattedId}
            <Copy size={10} className="ml-2 opacity-50"/>
        </Button>
    );
};

interface CustomerCellProps {
    leadId: number;
}

export const CustomerCell: React.FC<CustomerCellProps> = ({leadId}) => {
    const {data: lead, isLoading} = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => fetchLeadById(leadId),
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) return <Skeleton className="h-10 w-32"/>;
    if (!lead) return <span className="text-slate-500">Unknown Lead</span>;

    const parts = lead.userInfo.split(' - ');
    const name = parts[0] || 'Unknown Name';
    const contact = parts[1] || parts[2] || 'No contact info';

    return (
        <div className="flex flex-col items-start gap-0.5">
            <span className="font-bold text-slate-200 text-sm truncate max-w-[150px]" title={name}>{name}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="truncate max-w-[140px]" title={contact}>{contact}</span>
            </div>
            <a href={`/admin/leads`} className="text-[10px] text-indigo-500/70 hover:text-indigo-400 mt-0.5">View
                Lead</a>
        </div>
    );
};

interface PropertyCellProps {
    leadId: number;
    sumInsured: number;
}

export const PropertyCell: React.FC<PropertyCellProps> = ({leadId, sumInsured}) => {
    const {data: lead} = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => fetchLeadById(leadId),
        staleTime: 1000 * 60 * 5,
    });

    const propertyId = lead?.propertyInfo;

    const {data: property, isLoading} = useQuery({
        queryKey: ['property', propertyId],
        queryFn: () => fetchPropertyById(propertyId!),
        enabled: !!propertyId,
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading && propertyId) return <Skeleton className="h-10 w-40"/>;

    const location = property?.location;
    const address = location ? `${location.street}, ${location.city}` : 'No property info';
    const formattedSum = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(sumInsured);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 max-w-[200px]" title={address}>
                <Building className="h-3 w-3 text-slate-600 shrink-0"/>
                <span className="text-sm text-slate-300 truncate">{address}</span>
            </div>
            <span className="text-xs font-medium text-emerald-500/90 pl-4.5">{formattedSum}</span>
        </div>
    );
};

interface PlanPremiumCellProps {
    plan: string;
    totalPremium: number;
}

export const PlanPremiumCell: React.FC<PlanPremiumCellProps> = ({plan, totalPremium}) => {
    const getBadgeStyle = (p: string) => {
        switch (p) {
            case 'BRONZE':
                return "bg-amber-900/30 text-amber-500 border-amber-700/50";
            case 'SILVER':
                return "bg-slate-700/30 text-slate-300 border-slate-600/50";
            case 'GOLD':
                return "bg-yellow-900/30 text-yellow-500 border-yellow-700/50";
            default:
                return "bg-slate-800 text-slate-400";
        }
    };

    const formattedPremium = totalPremium > 0
        ? new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(totalPremium)
        : '-';

    return (
        <div className="flex flex-col items-start gap-1">
            <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 uppercase", getBadgeStyle(plan))}>
                {plan}
            </Badge>
            <span className="font-bold text-slate-200 text-sm tracking-tight">{formattedPremium}</span>
        </div>
    );
};

interface AgentCellProps {
    agentId: string;
    agentName?: string;
}

export const AgentCell: React.FC<AgentCellProps> = ({agentId, agentName}) => {
    const {data: agent, isLoading} = useQuery({
        queryKey: ['user', agentId],
        queryFn: () => fetchUserById(agentId),
        staleTime: 1000 * 60 * 5,
        enabled: !!agentId,
    });

    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full"/>;

    let displayName = agentName || agentId;
    let username = agentId;

    if (agent) {
        displayName = `${agent.firstName} ${agent.lastName}`.trim();
        if (!displayName) displayName = agent.username;
        username = agent.username;
    }

    const isSystem = agentId === 'admin' || displayName.toLowerCase().includes('admin');

    const initial = displayName.charAt(0).toUpperCase();
    const avatarColor = isSystem
        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
        : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";

    return (
        <div className="flex items-center gap-3">
            <div
                className={cn("h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm", avatarColor)}>
                {initial}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]" title={displayName}>
                    {isSystem ? "System Admin" : displayName}
                </span>
                {!isSystem && <span className="text-[10px] text-slate-500">@{username}</span>}
            </div>
        </div>
    );
};