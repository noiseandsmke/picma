import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeadById, LeadDto } from '../services/leadService';
import { fetchUserById } from '../services/userService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Building, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuoteIdCellProps {
    id: number;
    dateStr?: string;
}

export const QuoteIdCell: React.FC<QuoteIdCellProps> = ({ id }) => {
    const formattedId = `#${id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(id.toString())
            .then(() => toast.success("Quote ID copied"))
            .catch((err) => console.error("Failed to copy", err));
    };

    return (
        <Button
            variant="ghost"
            className="font-mono text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 h-auto p-1 px-2"
            onClick={handleCopy}
            title="Click to copy"
        >
            {formattedId}
        </Button>
    );
};

interface CustomerCellProps {
    leadId: number;
    leadData?: LeadDto | null;
    onViewLead?: (id: number) => void;
}

export const CustomerCell: React.FC<CustomerCellProps> = ({ leadId, leadData, onViewLead }) => {
    const { data: fetchedLead, isLoading: isLeadLoading } = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => fetchLeadById(leadId),
        enabled: !leadData,
        staleTime: 1000 * 60 * 5,
    });

    const lead = leadData || fetchedLead;

    const { data: user } = useQuery({
        queryKey: ['user', lead?.userInfo],
        queryFn: () => {
            const userId = lead?.userInfo;
            if (userId && !userId.includes(' - ')) {
                return fetchUserById(userId).catch(() => null);
            }
            return null;
        },
        enabled: !!lead?.userInfo && !lead.userInfo.includes(' - ')
    });

    if (!leadData && isLeadLoading) return <Skeleton className="h-10 w-32 bg-slate-800" />;
    if (!lead) return <span className="text-slate-500">Unknown Lead</span>;

    let name = 'Unknown Name';
    let email = 'No email';

    if (user) {
        name = `${user.firstName} ${user.lastName}`;
        email = user.email;
    } else {
        const parts = lead.userInfo.split(' - ');
        if (parts.length > 1) {
            name = parts[0];
            email = parts[1] || '';
        } else {
            name = `User ${lead.userInfo.substring(0, 8)}...`;
        }
    }

    return (
        <div className="flex items-center gap-2 group">
            <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold text-slate-200 text-sm truncate max-w-[150px]" title={name}>{name}</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="truncate max-w-[140px]" title={email}>{email}</span>
                </div>
            </div>
            {onViewLead && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewLead(leadId);
                    }}
                    title="View Lead Details"
                >
                    <ExternalLink size={12} />
                </Button>
            )}
        </div>
    );
};

interface PropertyCellProps {
    address: string;
    sumInsured: number;
}

export const PropertyCell: React.FC<PropertyCellProps> = ({ address, sumInsured }) => {
    let line1 = address;
    let line2 = "";

    if (address?.includes(',')) {
        const parts = address.split(',');
        line1 = parts[0].trim();
        line2 = parts.slice(1).join(',').trim();
    }

    const formattedSum = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(sumInsured);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2 max-w-[200px]" title={address}>
                <Building className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                    <span className="text-sm text-slate-200 font-medium truncate">{line1}</span>
                    {line2 && <span className="text-xs text-slate-500 truncate">{line2}</span>}
                </div>
            </div>
            <span className="text-xs font-medium text-emerald-500/90 pl-5.5">{formattedSum}</span>
        </div>
    );
};

interface PlanPremiumCellProps {
    plan: string;
    totalPremium: number;
}

export const PlanPremiumCell: React.FC<PlanPremiumCellProps> = ({ plan, totalPremium }) => {
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
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPremium)
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
}

export const AgentCell: React.FC<AgentCellProps> = ({ agentId }) => {
    const { data: agent, isLoading } = useQuery({
        queryKey: ['user', agentId],
        queryFn: () => fetchUserById(agentId),
        staleTime: 1000 * 60 * 5,
        enabled: !!agentId,
    });

    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />;

    if (isLoading) return <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />;

    let displayName = agentId;
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

interface ValidityCellProps {
    validUntil: string;
}

export const ValidityCell: React.FC<ValidityCellProps> = ({ validUntil }) => {
    if (!validUntil) return <span className="text-slate-500 text-xs">-</span>;

    const endDate = new Date(validUntil);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const checkDate = new Date(endDate);
    checkDate.setHours(0, 0, 0, 0);

    const isExpired = checkDate < now;

    return (
        <div className="flex flex-col items-start gap-1">
            <Badge
                variant="outline"
                className={cn(
                    "text-[10px] h-5 px-1.5 uppercase border",
                    isExpired
                        ? "bg-red-900/20 text-red-400 border-red-800/50"
                        : "bg-emerald-900/20 text-emerald-400 border-emerald-800/50"
                )}
            >
                {isExpired ? "Expired" : "Active"}
            </Badge>
            <span className="text-[10px] text-slate-500 font-medium">
                Until: {new Date(validUntil).toLocaleDateString('vi-VN')}
            </span>
        </div>
    );
};