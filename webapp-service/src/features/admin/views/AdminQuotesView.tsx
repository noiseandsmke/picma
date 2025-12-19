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
import {Checkbox} from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {OwnerQuoteDetailDialog} from "@/features/owner/components/OwnerQuoteDetailDialog";

const AdminQuotesView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});

    const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
    const [isQuoteDetailOpen, setIsQuoteDetailOpen] = useState(false);

    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

    const {
        data: quotes,
        isLoading: isQuotesLoading,
        isError: isQuotesError
    } = useQuery({
        queryKey: ['admin-quotes', sortConfig, selectedStatus, selectedAgent],
        queryFn: () => {
             const sortBy = sortConfig.key === 'premium' ? 'premium.total' : sortConfig.key;
             return fetchAllQuotes(sortBy, sortConfig.direction, selectedStatus || undefined, selectedAgent || undefined)
        },
    });

    const {data: leads} = useQuery({
        queryKey: ['admin-leads-lookup'],
        queryFn: () => fetchAllLeads()
    });

    const {data: agents} = useQuery({
        queryKey: ['admin-agents-lookup'],
        queryFn: () => fetchUsers('agent')
    });

    const {data: owners} = useQuery({
        queryKey: ['admin-owners-lookup'],
        queryFn: () => fetchUsers('owner')
    });

    const getOwnerInfo = (leadId: number) => {
        const lead = leads?.find(l => l.id === leadId);
        if (!lead) return {name: 'Unknown Lead', sub: '', details: null};
        
        const owner = owners?.find(u => u.id === lead.userInfo);
        if (owner) {
             return {
                 name: `${owner.firstName} ${owner.lastName}`,
                 sub: owner.email,
                 details: owner
             };
        }


        let name = lead.userInfo;
        let sub = '';

        if (name && name.includes(' - ')) {
            const parts = name.split(' - ');
            name = parts[0];
            sub = parts[1];
        }
        return {name, sub, details: null};
    };

    const getAgentInfo = (agentId: string) => {
        const agent = agents?.find(a => a.username === agentId || a.id === agentId);
        if (agent) return {name: `${agent.firstName} ${agent.lastName}`, email: agent.email};
        return {name: agentId, email: 'Unknown agent'};
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(amount);
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
            case 'NEW':
                return "bg-primary/10 text-primary border-primary/20";
            default:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const filteredQuotes = quotes;

    const columns: Column[] = [
        {
            header: <div className="flex items-center gap-1">ID {sortConfig.key === 'id' &&
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>}</div>,
            width: "8%",
            onClick: () => handleSort('id'),
        },
        {
            header: "Owner",
            width: "18%",
        },
        {
            header: "Property",
            width: "20%",
        },
        {
            header: <div className="flex items-center gap-1">Premium {sortConfig.key === 'premium' &&
                <span className="material-symbols-outlined text-[16px]">unfold_more</span>}</div>,
            width: "12%",
            onClick: () => handleSort('premium'),
        },
        {
            header: <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-auto p-0 font-normal hover:bg-transparent hover:text-white text-xs uppercase tracking-wider text-slate-400">
                    Agent
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost"
                                aria-label="Filter by agent"
                                className="h-6 w-6 p-0 hover:bg-slate-800 rounded-full relative ml-1">
                            <span className={cn("material-symbols-outlined text-[16px]", selectedAgent ? "text-primary" : "text-slate-500")}>filter_list</span>
                            {selectedAgent && (
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border-2 border-slate-900"/>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start"
                                         className="bg-slate-900 border-slate-700 text-slate-200 w-56 max-h-64 overflow-y-auto">
                        <DropdownMenuLabel
                            className="text-xs font-normal text-slate-500 uppercase tracking-wider px-2 py-1.5">
                            Filter by agent
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5"/>
                        <DropdownMenuItem
                            className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                            onSelect={() => setSelectedAgent(null)}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <Checkbox
                                    checked={selectedAgent === null}
                                    className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                />
                                <span className="text-sm">All Agents</span>
                            </div>
                        </DropdownMenuItem>
                        {agents?.map((agent) => (
                            <DropdownMenuItem
                                key={agent.id}
                                className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                                onSelect={() => setSelectedAgent(agent.id || null)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Checkbox
                                        checked={selectedAgent === agent.id}
                                        className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                    />
                                    <span className="text-sm truncate">{agent.firstName} {agent.lastName}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>,
            width: "18%",
        },
        {
            header: <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-auto p-0 font-normal hover:bg-transparent hover:text-white text-xs uppercase tracking-wider text-slate-400">
                    Status
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost"
                                aria-label="Filter by status"
                                className="h-6 w-6 p-0 hover:bg-slate-800 rounded-full relative ml-1">
                            <span className={cn("material-symbols-outlined text-[16px]", selectedStatus ? "text-primary" : "text-slate-500")}>filter_list</span>
                            {selectedStatus && (
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border-2 border-slate-900"/>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start"
                                         className="bg-slate-900 border-slate-700 text-slate-200 w-56">
                        <DropdownMenuLabel
                            className="text-xs font-normal text-slate-500 uppercase tracking-wider px-2 py-1.5">
                            Filter by status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5"/>
                        <DropdownMenuItem
                            className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                            onSelect={() => setSelectedStatus(null)}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <Checkbox
                                    checked={selectedStatus === null}
                                    className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                />
                                <span className="text-sm">All Statuses</span>
                            </div>
                        </DropdownMenuItem>
                        {['NEW', 'ACCEPTED', 'REJECTED'].map((status) => (
                            <DropdownMenuItem
                                key={status}
                                className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                                onSelect={() => setSelectedStatus(prev => prev === status ? null : status)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Checkbox
                                        checked={selectedStatus === status}
                                        className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                    />
                                    <span className="text-sm">{status}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>,
            width: "10%",
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
            const owner = getOwnerInfo(quote.leadId);
            const agent = getAgentInfo(quote.agentId);

            const getQuoteAddress = (leadId: number) => {
                const lead = leads?.find(l => l.id === leadId);
                if (!lead) return 'Unknown Property';
                
                if (lead.propertyInfo && lead.propertyInfo.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(lead.propertyInfo);
                        if (parsed.address) return parsed.address;
                        if (parsed.location) {
                            return `${parsed.location.street}, ${parsed.location.ward}, ${parsed.location.city}`;
                        }
                    } catch {
                    }
                }

                return lead.propertyInfo || 'N/A';
            };

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
                                <span className="font-medium text-white text-sm line-clamp-1">{owner.name}</span>
                                <span className="text-xs text-slate-500 line-clamp-1">{owner.sub}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="py-3">
                        <div className="flex flex-col">
                            <span
                                className="text-slate-200 text-sm font-medium line-clamp-1">{getQuoteAddress(quote.leadId)}</span>

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

                    <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={() => {
                                setSelectedQuote(quote);
                                setIsQuoteDetailOpen(true);
                            }}
                        >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Button>
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


            </div>

            {selectedQuote && (
                <OwnerQuoteDetailDialog
                    open={isQuoteDetailOpen}
                    onOpenChange={setIsQuoteDetailOpen}
                    quote={selectedQuote}
                    lead={leads?.find(l => l.id === selectedQuote.leadId) as any} 
                    onAccept={() => {}}
                    onReject={() => {}}
                    isPendingAction={false}
                />
            )}
        </AdminLayout>
    );
};

export default AdminQuotesView;