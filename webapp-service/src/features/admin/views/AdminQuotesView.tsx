import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import { fetchAllQuotes } from '../services/quoteService';
import { ArrowUpDown, CalendarClock, Eye, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from "@/components/ui/table";
import SharedTable, { Column } from "@/components/ui/shared-table";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AgentCell,
    CustomerCell,
    CoveragesCell,
    PropertyCell,
    QuoteIdCell,
    ValidityCell
} from '../components/QuoteCells';
import { LeadDetailDialog } from "@/features/admin/components/LeadDetailDialog";
import { fetchAllLeads } from "@/features/admin/services/leadService";

const AdminQuotesView: React.FC = () => {
    const queryClient = useQueryClient();
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

    const {
        data: quotes,
        isLoading: isQuotesLoading,
        isError: isQuotesError
    } = useQuery({
        queryKey: ['admin-quotes', sortConfig],
        queryFn: () => fetchAllQuotes(sortConfig.key, sortConfig.direction),
    });

    const { data: leads } = useQuery({
        queryKey: ['admin-leads-lookup'],
        queryFn: () => fetchAllLeads()
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
        setSortConfig({ key, direction });
    };

    const columns: Column[] = [
        {
            header: (
                <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                    Quote ID {sortConfig.key === 'id' && <ArrowUpDown size={12} />}
                </div>
            ),
            width: "10%",
            className: "text-slate-400",
            onClick: () => handleSort('id'),
        },
        {
            header: (
                <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                    Customer {sortConfig.key === 'leadId' && <ArrowUpDown size={12} />}
                </div>
            ),
            width: "15%",
            className: "text-slate-400",
            onClick: () => handleSort('leadId'),
        },
        {
            header: "Property",
            width: "20%",
            className: "text-slate-400",
        },
        {
            header: "Coverage & Premium",
            width: "15%",
            className: "text-slate-400",
        },
        {
            header: (
                <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                    Agent {sortConfig.key === 'agentId' && <ArrowUpDown size={12} />}
                </div>
            ),
            width: "20%",
            className: "text-slate-400",
            onClick: () => handleSort('agentId'),
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    <CalendarClock size={14} /> Validity
                </div>
            ),
            width: "15%",
            className: "text-slate-400",
        },
        {
            header: "",
            width: "5%",
            className: "text-slate-400",
        }
    ];

    const renderTableContent = () => {
        if (isQuotesLoading) {
            return [1, 2, 3, 4, 5].map((id) => (
                <TableRow key={`skeleton-${id}`} className="border-slate-800">
                    <TableCell><Skeleton className="h-6 w-24 bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-20 bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
                </TableRow>
            ));
        }

        if (isQuotesError) {
            return (
                <TableRow className="border-slate-800">
                    <TableCell colSpan={7} className="h-32 text-center text-red-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <p>Failed to load quotes data.</p>
                            <Button variant="outline" size="sm"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })}>
                                Retry
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        return quotes?.map((quote) => (
            <TableRow key={quote.id}
                className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                <TableCell>
                    <QuoteIdCell id={quote.id} />
                </TableCell>

                <TableCell>
                    <CustomerCell
                        leadId={quote.leadId}
                        leadData={leads?.find(l => l.id === quote.leadId)}
                        onViewLead={handleViewLead}
                    />
                </TableCell>

                <TableCell>
                    <PropertyCell address={quote.propertyAddress}
                        sumInsured={quote.sumInsured} />
                </TableCell>

                <TableCell>
                    <CoveragesCell coverages={quote.coverages}
                        totalPremium={quote.premium?.total || 0} />
                </TableCell>

                <TableCell>
                    <AgentCell agentId={quote.agentId} />
                </TableCell>

                <TableCell>
                    <ValidityCell validUntil={quote.validUntil} />
                </TableCell>

                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-slate-800 text-slate-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end"
                            className="bg-slate-900 border-slate-800 text-slate-200">
                            <DropdownMenuItem onClick={() => handleViewLead(quote.leadId)}
                                className="hover:bg-slate-800 cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View lead
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">All quotes</h3>
                            <p className="text-sm text-slate-400">Manage and track all customer quotes with enriched
                                context.</p>
                        </div>
                        <div className="flex gap-2">
                        </div>
                    </div>
                    <div className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isQuotesLoading}
                            isEmpty={!isQuotesLoading && !isQuotesError && (!quotes || quotes.length === 0)}
                            emptyMessage="No quotes found."
                        >
                            {renderTableContent()}
                        </SharedTable>
                    </div>
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