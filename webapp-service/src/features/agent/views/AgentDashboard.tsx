import React, { useMemo, useState } from 'react';
import AgentLayout from '../layouts/AgentLayout';
import { Bell, DollarSign, FileText, Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentLeadDto, fetchAgentLeads, fetchAgentQuotes, updateLeadAction } from '../services/agentService';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from "sonner";
import { AgentQuoteForm } from '@/features/agent/components/AgentQuoteForm';
import { createQuote, CreateQuoteDto, PropertyQuoteDto, updateQuote } from '@/features/admin/services/quoteService';
import { AgentLeadCard } from '@/features/agent/components/AgentLeadCard';
import { AgentActionDialog } from '@/features/agent/components/AgentActionDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AgentDashboard: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const agentId = user?.id || '';
    const [activeTab, setActiveTab] = useState<'new' | 'portfolio'>('new');
    const [selectedLead, setSelectedLead] = useState<AgentLeadDto | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<PropertyQuoteDto | null>(null);
    const [loadingLeadId, setLoadingLeadId] = useState<number | null>(null);

    const { data: leads, isLoading: isLeadsLoading } = useQuery({
        queryKey: ['agent-leads', agentId],
        queryFn: () => fetchAgentLeads(agentId),
        enabled: !!agentId,
        refetchInterval: 30000
    });

    const { data: quotes, isLoading: isQuotesLoading } = useQuery({
        queryKey: ['agent-quotes', agentId],
        queryFn: () => fetchAgentQuotes(agentId),
        enabled: !!agentId
    });

    const prevLeadsRef = React.useRef<AgentLeadDto[]>([]);
    React.useEffect(() => {
        if (leads && prevLeadsRef.current.length > 0) {
            const newLeadIds = leads.map(l => l.leadId);
            const prevLeadIds = new Set(prevLeadsRef.current.map(l => l.leadId));
            const added = newLeadIds.filter(id => !prevLeadIds.has(id));
            if (added.length > 0) {
                toast.info(`You have ${added.length} new lead opportunity!`);
            }
        }
        if (leads) {
            prevLeadsRef.current = leads;
        }
    }, [leads]);


    const leadActionMutation = useMutation({
        mutationFn: updateLeadAction,
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['agent-leads'] });
            setLoadingLeadId(null);

            if (variables.leadAction === 'INTERESTED') {
                setSelectedLead(data);
                setIsActionDialogOpen(true);
                toast.success("You are now interested in this lead");
            } else if (variables.leadAction === 'REJECTED') {
                toast.success("Lead rejected");
                setIsActionDialogOpen(false);
            }
        },
        onError: (error) => {
            setLoadingLeadId(null);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || "Failed to update lead status";
            toast.error(msg);
        }
    });

    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['agent-quotes'] });
            await queryClient.invalidateQueries({ queryKey: ['agent-leads'] });
            setIsQuoteFormOpen(false);
            setIsActionDialogOpen(false);
            toast.success("Quote created & lead accepted successfully");

            if (variables.leadId) {
                const lead = leads?.find(l => l.leadId === variables.leadId);
                if (lead && lead.leadAction !== 'ACCEPTED') {
                    leadActionMutation.mutate({
                        id: lead.id,
                        leadId: lead.leadId,
                        agentId: agentId,
                        leadAction: 'ACCEPTED'
                    });
                }
            }
        },
        onError: () => toast.error("Failed to create quote")
    });

    const updateMutation = useMutation({
        mutationFn: updateQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['agent-quotes'] });
            setIsQuoteFormOpen(false);
            toast.success("Quote updated successfully");
        },
        onError: () => toast.error("Failed to update quote")
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFormSubmit = (data: any) => {
        if (editingQuote) {
            updateMutation.mutate({
                ...editingQuote,
                ...data, id: editingQuote.id
            } as PropertyQuoteDto);
        } else {
            createMutation.mutate(data as CreateQuoteDto);
        }
    };

    const handleViewDetail = (lead: AgentLeadDto) => {
        if (lead.leadAction) {
            setSelectedLead(lead);
            setIsActionDialogOpen(true);
        } else {
            setLoadingLeadId(lead.leadId);
            leadActionMutation.mutate({
                id: lead.id,
                leadId: lead.leadId,
                agentId: lead.agentId,
                leadAction: 'INTERESTED'
            });
        }
    };

    const handleCreateQuote = (leadId: number) => {
        const existingQuote = quotes?.find(q => q.leadId === leadId);
        if (existingQuote) {
            setEditingQuote(existingQuote);
        } else {
            setEditingQuote(null);
        }
        setIsQuoteFormOpen(true);
        setIsActionDialogOpen(false);
    };

    const handleRejectLead = (lead: AgentLeadDto) => {
        leadActionMutation.mutate({
            id: lead.id,
            leadId: lead.leadId,
            agentId: lead.agentId,
            leadAction: 'REJECTED'
        });
    };

    const newLeads = useMemo(() => leads?.filter(l => !l.leadAction) || [], [leads]);
    const allInteractedLeads = useMemo(() => leads?.filter(l => l.leadAction) || [], [leads]);

    const newLeadsCount = newLeads.length;

    const thisMonthValue = useMemo(() => {
        if (!quotes) return 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        return quotes.reduce((acc, q) => {
            if (q.startDate) {
                const d = new Date(q.startDate);
                if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
                    return acc + (q.premium?.total || 0);
                }
            }
            return acc;
        }, 0);
    }, [quotes]);


    const isLoading = isLeadsLoading || isQuotesLoading;

    const totalCoverageProvided = useMemo(() => {
        if (!quotes) return 0;
        return quotes
            .filter(q => q.status === 'ACCEPTED')
            .reduce((acc, q) => acc + (q.sumInsured || 0), 0);
    }, [quotes]);

    const activeQuotesCount = useMemo(() => {
        if (!quotes) return 0;
        return quotes.filter(q => q.status === 'ACTIVE' || q.status === 'PENDING').length;
    }, [quotes]);

    return (
        <AgentLayout>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Coverage Provided</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ? <Skeleton
                                        className="h-8 w-24 bg-slate-800" /> : formatCurrency(totalCoverageProvided)}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Active Quotes</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ? <Skeleton className="h-8 w-12 bg-slate-800" /> : activeQuotesCount}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                <FileText className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">This Month</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ?
                                        <Skeleton className="h-8 w-24 bg-slate-800" /> : formatCurrency(thisMonthValue)}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">New Opportunities</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ? <Skeleton className="h-8 w-12 bg-slate-800" /> : newLeadsCount}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                <Bell className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-6 border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab('new')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'new' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                New Leads
                                {activeTab === 'new' && <div
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('portfolio')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'portfolio' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Quote History & Portfolio
                                {activeTab === 'portfolio' && <div
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
                            </button>
                        </div>

                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="w-full pl-9 h-9 rounded-md bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            [1, 2, 3].map((id) => (
                                <Skeleton key={`skeleton-${id}`} className="h-64 w-full rounded-xl bg-slate-800" />
                            ))
                        ) : (
                            <>
                                {activeTab === 'new' && (
                                    newLeads.length === 0 ? (
                                        <div
                                            className="col-span-full py-12 text-center text-slate-500 bg-[#141124] rounded-xl border border-dashed border-slate-800">
                                            <p>No new leads found in your area.</p>
                                        </div>
                                    ) : (
                                        newLeads.map(lead => (
                                            <AgentLeadCard
                                                key={lead.id}
                                                lead={lead}
                                                onViewDetail={handleViewDetail}
                                                isLoadingAction={loadingLeadId === lead.leadId}
                                            />
                                        ))
                                    )
                                )}

                                {activeTab === 'portfolio' && (
                                    allInteractedLeads.length === 0 ? (
                                        <div
                                            className="col-span-full py-12 text-center text-slate-500 bg-[#141124] rounded-xl border border-dashed border-slate-800">
                                            <p>No active portfolio items yet.</p>
                                        </div>
                                    ) : (
                                        allInteractedLeads.map(lead => (
                                            <AgentLeadCard
                                                key={lead.id}
                                                lead={lead}
                                                onViewDetail={handleViewDetail}
                                            />
                                        ))
                                    )
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AgentActionDialog
                open={isActionDialogOpen}
                onOpenChange={setIsActionDialogOpen}
                lead={selectedLead}
                onCreateQuote={handleCreateQuote}
                onReject={handleRejectLead}
                isPending={leadActionMutation.isPending}
                hasQuote={!!quotes?.find(q => q.leadId === selectedLead?.leadId)}
            />

            <Dialog open={isQuoteFormOpen} onOpenChange={setIsQuoteFormOpen}>
                <DialogContent
                    className="bg-slate-950 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
                    </DialogHeader>
                    <AgentQuoteForm
                        lead={selectedLead}
                        agentId={agentId}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsQuoteFormOpen(false)}
                        isLoading={createMutation.isPending || updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </AgentLayout>
    );
};

export default AgentDashboard;