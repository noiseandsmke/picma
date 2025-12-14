import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import { createQuote, deleteQuote, fetchAllQuotes, PropertyQuoteDto, updateQuote } from '../services/quoteService';
import { format } from 'date-fns';
import { ArrowUpDown, CalendarClock, Eye, MoreHorizontal, PlusCircle } from 'lucide-react';
import { TableCell, TableRow } from "@/components/ui/table";
import SharedTable, { Column } from "@/components/ui/shared-table";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AgentCell,
    CustomerCell,
    PlanPremiumCell,
    PropertyCell,
    QuoteIdCell,
    ValidityCell
} from '../components/QuoteCells';
import { QuoteForm } from '../components/QuoteForm';
import { LeadDetailDialog } from "@/features/admin/components/LeadDetailDialog";
import { fetchAllLeads } from "@/features/admin/services/leadService";

const AdminQuotesView: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<PropertyQuoteDto | null>(null);
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

    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
        },
    });

    const handleFormSubmit = (data: any) => {
        const payload = {
            ...data,
            startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
            endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
        };

        if (selectedQuote) {
            updateMutation.mutate({
                ...selectedQuote,
                ...payload,
                plan: payload.plan,
                sumInsured: payload.sumInsured,
                coverages: payload.coverages,
                premium: payload.premium
            } as PropertyQuoteDto);
        } else {
            createMutation.mutate({
                ...payload,
            } as PropertyQuoteDto);
        }
    };

    const handleEdit = (quote: PropertyQuoteDto) => {
        setSelectedQuote(quote);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedQuote(null);
        setIsModalOpen(true);
    };

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
            header: "Plan & premium",
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
                            <Button onClick={handleCreate} variant="outline"
                                className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create quote
                            </Button>
                        </div>
                    </div>
                    <div className="p-0">
                        <SharedTable
                            columns={columns}
                            isLoading={isQuotesLoading}
                            isEmpty={!isQuotesLoading && !isQuotesError && (!quotes || quotes.length === 0)}
                            emptyMessage="No quotes found."
                        >
                            {isQuotesLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-800">
                                        <TableCell><Skeleton className="h-6 w-24 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-full bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-full bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-20 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-full bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
                                    </TableRow>
                                ))
                            ) : isQuotesError ? (
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
                            ) : quotes?.map((quote) => (
                                <TableRow key={quote.id}
                                    className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                    <TableCell>
                                        <QuoteIdCell id={quote.id} dateStr={quote.startDate} />
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
                                        <PlanPremiumCell plan={quote.plan}
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
                                                <DropdownMenuItem onClick={() => handleEdit(quote)}
                                                    className="hover:bg-slate-800 cursor-pointer">
                                                    Edit quote
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => deleteMutation.mutate(quote.id)}
                                                    className="text-red-400 hover:bg-red-950/20 hover:text-red-300 cursor-pointer">
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </SharedTable>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent
                        className="bg-slate-950 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedQuote ? 'Edit quote' : 'Create new quote'}</DialogTitle>
                        </DialogHeader>
                        <QuoteForm
                            initialData={selectedQuote}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>

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