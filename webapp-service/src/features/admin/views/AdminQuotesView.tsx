import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchAllQuotes} from '../services/quoteService';
import {fetchAllLeads} from '../services/leadService';
import {fetchUsers} from '../services/userService';
import {cn} from '@/lib/utils';
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {LeadDetailDialog} from "@/features/admin/components/LeadDetailDialog";

const AdminQuotesView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});

    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

    const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);

    const {
        data: quotes,
        isLoading: isQuotesLoading,
        isError: isQuotesError
    } = useQuery({
        queryKey: ['admin-quotes', sortConfig],
        queryFn: () => fetchAllQuotes(sortConfig.key, sortConfig.direction),
    });

    const {data: leads} = useQuery({
        queryKey: ['admin-leads-lookup'],
        queryFn: () => fetchAllLeads()
    });

    const {data: agents} = useQuery({
        queryKey: ['admin-agents-lookup'],
        queryFn: () => fetchUsers('agent')
    });

    const handleViewLead = (leadId: number) => {
        setSelectedLeadId(leadId);
        setIsLeadDetailOpen(true);
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const getCustomerInfo = (leadId: number) => {
        const lead = leads?.find(l => l.id === leadId);
        if (!lead) return {name: 'Unknown', sub: `Lead #${leadId}`};

        let name = lead.userInfo;
        let sub = `Lead #${leadId}`;

        if (name.includes(' - ')) {
            const parts = name.split(' - ');
            name = parts[0];
            sub = parts[1];
        }
        return {name, sub};
    };

    const getAgentInfo = (agentId: string) => {
        const agent = agents?.find(a => a.username === agentId || a.id === agentId);
        if (agent) return {name: `${agent.firstName} ${agent.lastName}`, email: agent.email};
        return {name: agentId, email: 'Unknown agent'};
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(amount);
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'REJECTED':
                return "bg-red-500/10 text-red-500 border-red-500/20";
            case 'PENDING':
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'DRAFT':
                return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            case 'ACTIVE':
                return "bg-primary/10 text-primary border-primary/20";
            default:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const filteredQuotes = quotes;

    const columns: Column[] = [
        {
            header: <div className="flex items-center gap-1">Quote ID {sortConfig.key === 'id' &&
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>}</div>,
            width: "8%",
            onClick: () => handleSort('id'),
        },
        {
            header: "Customer",
            width: "18%",
        },
        {
            header: "Property",
            width: "20%",
        },
        {
            header: "Premium",
            width: "12%",
        },
        {
            header: "Agent",
            width: "18%",
        },
        {
            header: "Status",
            width: "10%",
        },
        {
            header: <div className="flex items-center gap-1">Created {sortConfig.key === 'startDate' &&
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>}</div>,
            width: "10%",
            onClick: () => handleSort('startDate'),
        },
        {
            header: "",
            width: "5%",
            className: "text-right"
        }
    ];

    let content;
    if (isQuotesLoading) {
        content = Array.from({length: 5}).map((_, i) => (
            <TableRow key={i} className="border-b border-slate-700/50">
                <TableCell><Skeleton className="h-4 w-12 bg-slate-800"/></TableCell>
                <TableCell>
                    <div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full bg-slate-800"/>
                        <div className="space-y-1"><Skeleton className="h-4 w-24 bg-slate-800"/><Skeleton
                            className="h-3 w-16 bg-slate-800"/></div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="space-y-1"><Skeleton className="h-4 w-32 bg-slate-800"/><Skeleton
                        className="h-3 w-20 bg-slate-800"/></div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20 bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-4 w-20 bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
            </TableRow>
        ));
    } else if (isQuotesError) {
        content = (
            <TableRow className="border-slate-700/50 hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">error</span>
                        <p>Failed to load quotes data.</p>
                    </div>
                </TableCell>
            </TableRow>
        );
    } else {
        content = filteredQuotes?.map((quote) => {
            const customer = getCustomerInfo(quote.leadId);
            const agent = getAgentInfo(quote.agentId);

            return (
                <TableRow key={quote.id}
                          className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                    <TableCell className="font-medium text-slate-400">#{quote.id}</TableCell>
                    <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50 shrink-0">
                                <span className="material-symbols-outlined text-[16px]">person</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-white text-sm line-clamp-1">{customer.name}</span>
                                <span className="text-xs text-slate-500 line-clamp-1">{customer.sub}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="py-3">
                        <div className="flex flex-col">
                            <span
                                className="text-slate-200 text-sm font-medium line-clamp-1">{quote.propertyAddress}</span>
                            <span className="text-xs text-slate-500">Sum: {formatCurrency(quote.sumInsured)}</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-3">
                        <span
                            className="text-emerald-400 font-medium text-sm">{formatCurrency(quote.premium?.total || 0)}</span>
                    </TableCell>
                    <TableCell className="py-3">
                        <div className="flex flex-col">
                            <span className="text-slate-300 text-sm">{agent.name}</span>
                            <span className="text-xs text-slate-500">{agent.email}</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-3">
                        <Badge variant="outline"
                               className={cn("border-0 font-medium px-2 py-0.5", getStatusColor(quote.status))}>
                            {quote.status || 'DRAFT'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                        {formatDate(quote.startDate)}
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost"
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800">
                                    <span className="sr-only">Open menu</span>
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewLead(quote.leadId)}
                                                  className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px] mr-2">visibility</span>
                                    View Lead
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            );
        });
    }

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto pb-10">


                <div className="p-0">
                    <SharedTable
                        columns={columns}
                        isLoading={isQuotesLoading}
                        isEmpty={!isQuotesLoading && !isQuotesError && (!filteredQuotes || filteredQuotes.length === 0)}
                        emptyMessage="No quotes found."
                    >
                        {content}
                    </SharedTable>
                </div>

                {selectedLeadId && leads && (
                    <LeadDetailDialog
                        open={isLeadDetailOpen}
                        onOpenChange={setIsLeadDetailOpen}
                        lead={leads.find(l => l.id === selectedLeadId) || null}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminQuotesView;