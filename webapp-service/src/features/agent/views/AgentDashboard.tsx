import React, {useMemo, useState} from 'react';
import AgentLayout from '../layouts/AgentLayout';
import {Bell, DollarSign, FileText, Search, ShieldCheck} from 'lucide-react';
import {Card, CardContent} from "@/components/ui/card";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AgentLeadDto, fetchAgentLeads, fetchAgentQuotes, fetchLeadsByZipcode} from '../services/agentService';
import {Skeleton} from '@/components/ui/skeleton';
import {useAuth} from '@/context/AuthContext';
import {cn, formatCurrency} from '@/lib/utils';
import {toast} from "sonner";
import {AgentQuoteForm} from '@/features/agent/components/AgentQuoteForm';
import {createQuote, CreateQuoteDto, PropertyQuoteDto, updateQuote} from '@/features/admin/services/quoteService';
import {AgentLeadCard} from '@/features/agent/components/AgentLeadCard';
import {AgentActionDialog} from '@/features/agent/components/AgentActionDialog';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {AgentQuoteCard} from '@/features/agent/components/AgentQuoteCard';
import {fetchLeadById} from '@/features/agent/services/agentService';
import {PropertyAddressDisplay} from '@/features/agent/components/PropertyAddressDisplay';

const AgentDashboard: React.FC = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const agentId = user?.id || '';
    const [activeTab, setActiveTab] = useState<'new' | 'portfolio'>('new');
    const [selectedLead, setSelectedLead] = useState<AgentLeadDto | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<PropertyQuoteDto | null>(null);

    const {data: leads, isLoading: isLeadsLoading} = useQuery({
        queryKey: ['agent-leads', agentId, user?.zipcode],
        queryFn: () => {
            if (user?.zipcode) {
                return fetchLeadsByZipcode(user.zipcode);
            }
            return fetchAgentLeads();
        },
        enabled: !!agentId,
        refetchInterval: 30000
    });

    const {data: quotes, isLoading: isQuotesLoading} = useQuery({
        queryKey: ['agent-quotes', agentId],
        queryFn: () => fetchAgentQuotes(agentId),
        enabled: !!agentId
    });


    const mergedLeads = useMemo(() => {
        if (!leads) return [];
        return leads.map(lead => {

            const leadQuote = quotes?.find(q => q.leadId === lead.id);
            return {
                ...lead,
                quoteStatus: leadQuote?.status
            };
        });
    }, [leads, quotes]);

    const prevLeadsRef = React.useRef<AgentLeadDto[]>([]);
    React.useEffect(() => {
        if (mergedLeads && prevLeadsRef.current.length > 0) {
            const newLeadIds = mergedLeads.map(l => l.id);
            const prevLeadIds = new Set(prevLeadsRef.current.map(l => l.id));
            const added = newLeadIds.filter(id => !prevLeadIds.has(id));
            if (added.length > 0) {
                toast.info(`You have ${added.length} new lead opportunity!`);
            }
        }
        if (mergedLeads) {
            prevLeadsRef.current = mergedLeads;
        }
    }, [mergedLeads]);


    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['agent-quotes']});
            setIsQuoteFormOpen(false);
            setIsActionDialogOpen(false);
            toast.success("Quote created successfully");
        },
        onError: () => toast.error("Failed to create quote")
    });

    const updateMutation = useMutation({
        mutationFn: updateQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['agent-quotes']});
            setIsQuoteFormOpen(false);
            toast.success("Quote updated successfully");
        },
        onError: () => toast.error("Failed to update quote")
    });

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
        setSelectedLead(lead);
        setIsActionDialogOpen(true);
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


    const areaLeads = useMemo(() => mergedLeads?.filter(l => l.leadAction !== 'REJECTED') || [], [mergedLeads]);

    const handleViewQuote = async (quote: PropertyQuoteDto) => {
        try {
            const lead = await fetchLeadById(quote.leadId);
            setSelectedLead(lead);
            setEditingQuote(quote);
            setIsQuoteFormOpen(true);
        } catch (error) {
            console.error("Error fetching lead detail:", error);
            toast.error("Failed to load lead details");
        }
    };

    const areaLeadsCount = areaLeads.length;

    const thisMonthValue = useMemo(() => {
        if (!quotes) return 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        return quotes.reduce((acc, q) => {
            if (q.status !== 'ACCEPTED') return acc;


            if (q.createdDate) {
                const d = new Date(q.createdDate);
                if (!Number.isNaN(d.getTime())) {
                    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
                        return acc + (q.premium?.total || 0);
                    }
                }
            }
            return acc;
        }, 0);
    }, [quotes]);


    const getResolvedAddress = (lead: any) => {
        if (!lead?.propertyInfo) return 'Address unavailable';
        const info = lead.propertyInfo.trim();
        if (!info) return 'Address unavailable';

        if (info.startsWith('{')) {
            try {
                const parsed = JSON.parse(info);
                return parsed.address || (parsed.location ? `${parsed.location.street}, ${parsed.location.ward}, ${parsed.location.city}` : info);
            } catch {
                return info;
            }
        } else if (info.includes(' ')) {
            return info;
        } else {
            return <PropertyAddressDisplay propertyId={info}/>;
        }
    };

    const isLoading = isLeadsLoading || isQuotesLoading;

    const totalCoverageProvided = useMemo(() => {
        if (!quotes) return 0;
        return quotes
            .filter(q => q.status === 'ACCEPTED')
            .reduce((acc, q) => acc + (q.premium?.total || 0), 0);
    }, [quotes]);

    const activeQuotesCount = useMemo(() => {
        if (!quotes) return 0;
        return quotes.filter(q => q.status === 'NEW').length;
    }, [quotes]);

    return (
        <AgentLayout>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        className="bg-surface-main border border-border-main shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-muted group-hover:text-text-secondary transition-colors">Total
                                    Coverage Provided</p>
                                <h3 className="text-2xl font-bold text-text-main mt-1">
                                    {isLoading ? <Skeleton
                                        className="h-8 w-24 bg-muted"/> : formatCurrency(totalCoverageProvided)}
                                </h3>
                            </div>
                            <div
                                className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors border border-primary/20">
                                <ShieldCheck className="h-6 w-6"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="bg-surface-main border border-border-main shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-muted group-hover:text-text-secondary transition-colors">Active
                                    Quotes</p>
                                <h3 className="text-2xl font-bold text-text-main mt-1">
                                    {isLoading ? <Skeleton className="h-8 w-12 bg-muted"/> : activeQuotesCount}
                                </h3>
                            </div>
                            <div
                                className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors border border-primary/20">
                                <FileText className="h-6 w-6"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="bg-surface-main border border-border-main shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-muted group-hover:text-text-secondary transition-colors">This
                                    Month</p>
                                <h3 className="text-2xl font-bold text-text-main mt-1">
                                    {isLoading ?
                                        <Skeleton className="h-8 w-24 bg-muted"/> : formatCurrency(thisMonthValue)}
                                </h3>
                            </div>
                            <div
                                className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors border border-primary/20">
                                <DollarSign className="h-6 w-6"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="bg-surface-main border border-border-main shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text-muted group-hover:text-text-secondary transition-colors">Leads
                                    in Area</p>
                                <h3 className="text-2xl font-bold text-text-main mt-1">
                                    {isLoading ? <Skeleton className="h-8 w-12 bg-muted"/> : areaLeadsCount}
                                </h3>
                            </div>
                            <div
                                className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors border border-primary/20">
                                <Bell className="h-6 w-6"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-6 border-b border-border-main">
                            <button
                                onClick={() => setActiveTab('new')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'new' ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main hover:bg-muted/50 rounded-md px-2"
                                )}
                            >
                                Leads in Area
                            </button>
                            <button
                                onClick={() => setActiveTab('portfolio')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'portfolio' ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-main hover:bg-muted/50 rounded-md px-2"
                                )}
                            >
                                My quotes
                            </button>
                        </div>

                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted"/>
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="w-full pl-9 h-9 rounded-md bg-input-bg border border-input-border text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-muted"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            [1, 2, 3].map((id) => (
                                <Skeleton key={`skeleton-${id}`} className="h-24 w-full rounded-xl bg-muted"/>
                            ))
                        ) : (
                            <>
                                {activeTab === 'new' && (
                                    areaLeads.length === 0 ? (
                                        <div
                                            className="col-span-full py-12 text-center text-text-muted bg-muted rounded-xl border border-dashed border-border-main">
                                            <p>No leads found in your area.</p>
                                        </div>
                                    ) : (
                                        areaLeads.map(lead => (
                                            <AgentLeadCard
                                                key={lead.id}
                                                lead={lead}
                                                quoteStatus={lead.quoteStatus}
                                                onViewDetail={handleViewDetail}
                                                isLoadingAction={false}
                                            />
                                        ))
                                    )
                                )}

                                {activeTab === 'portfolio' && (
                                    (!quotes || quotes.length === 0) ? (
                                        <div
                                            className="col-span-full py-12 text-center text-text-muted bg-muted rounded-xl border border-dashed border-border-main">
                                            <p>No active quotes yet.</p>
                                        </div>
                                    ) : (
                                        quotes.map(quote => {
                                            const lead = leads?.find(l => l.id === quote.leadId);
                                            const addressNode = getResolvedAddress(lead);

                                            return (
                                                <AgentQuoteCard
                                                    key={quote.id}
                                                    quote={quote}
                                                    propertyAddress={addressNode}
                                                    onViewDetail={handleViewQuote}
                                                />
                                            );
                                        })
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
                quoteStatus={quotes?.find(q => q.leadId === selectedLead?.id)?.status}
                onCreateQuote={handleCreateQuote}
            />

            <Dialog open={isQuoteFormOpen} onOpenChange={setIsQuoteFormOpen}>
                <DialogContent
                    className="bg-surface-main border-border-main text-text-main max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
                    </DialogHeader>
                    <AgentQuoteForm
                        leadId={selectedLead?.id || 0}
                        agentId={agentId}
                        initialData={editingQuote || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsQuoteFormOpen(false)}
                        isPending={createMutation.isPending || updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </AgentLayout>
    );
};

export default AgentDashboard;