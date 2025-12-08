import React, {useMemo, useState} from 'react';
import AgentLayout from '../layouts/AgentLayout';
import {ArrowRight, Bell, Calendar, Clock, DollarSign, FileText, Search} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchAgentLeads, fetchAgentQuotes} from '../services/agentService';
import {Skeleton} from '@/components/ui/skeleton';
import {useAuth} from '@/context/AuthContext';
import {formatCurrency} from '@/lib/utils';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {toast} from "sonner";
import {QuoteForm} from '@/features/admin/components/QuoteForm';
import {createQuote, PropertyQuoteDto, updateQuote} from '@/features/admin/services/quoteService';
import {format} from 'date-fns';
import {LeadDto} from '@/features/admin/services/leadService';

const SKELETON_IDS = ['skel-1', 'skel-2', 'skel-3'];

const AgentDashboard: React.FC = () => {
    const {user} = useAuth();
    const queryClient = useQueryClient();
    const agentId = user?.id || '';
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

    const {data: leads, isLoading: isLeadsLoading} = useQuery({
        queryKey: ['agent-leads', agentId],
        queryFn: () => fetchAgentLeads(agentId),
        enabled: !!agentId
    });

    const {data: quotes, isLoading: isQuotesLoading} = useQuery({
        queryKey: ['agent-quotes', agentId],
        queryFn: () => fetchAgentQuotes(agentId),
        enabled: !!agentId
    });

    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['agent-quotes']});
            setIsQuoteOpen(false);
            toast.success("Quote created successfully");
        },
        onError: () => toast.error("Failed to create quote")
    });

    const updateMutation = useMutation({
        mutationFn: updateQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['agent-quotes']});
            setIsQuoteOpen(false);
            toast.success("Quote updated successfully");
        },
        onError: () => toast.error("Failed to update quote")
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFormSubmit = (data: any) => {
        const payload = {
            ...data,
            startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
            endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
        };

        createMutation.mutate({
            ...payload,
        } as PropertyQuoteDto);
    };

    const openQuoteModal = (leadId: number) => {
        setSelectedLeadId(leadId);
        setIsQuoteOpen(true);
    };

    const newLeadsCount = useMemo(() => leads?.filter(l => l.status === 'NEW').length || 0, [leads]);
    const pendingQuotesCount = quotes?.length || 0;

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

    const leadColumns: Column[] = [
        {header: "Client", width: "25%"},
        {header: "Property", width: "35%"},
        {header: "Status", width: "15%"},
        {header: "Action", width: "25%", className: "text-right"}
    ];

    const isLoading = isLeadsLoading || isQuotesLoading;

    const quoteFormLeads: LeadDto[] = useMemo(() => leads?.map(l => ({
        id: l.id,
        userInfo: l.userInfo,
        propertyInfo: typeof l.propertyInfo === 'string' && l.propertyInfo.startsWith('{')
            ? JSON.parse(l.propertyInfo).id : l.propertyInfo,
        status: l.status,
        createDate: l.createdAt, expiryDate: l.createdAt,
    })) || [], [leads]);

    const initialQuoteData = useMemo(() => ({
        leadId: selectedLeadId || 0,
        agentId: agentId
    }), [selectedLeadId, agentId]);

    return (
        <AgentLayout>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">New leads</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ? <Skeleton
                                        className="h-8 w-12 bg-slate-800"/> : newLeadsCount}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                <Bell className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total quotes</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ? <Skeleton className="h-8 w-12 bg-slate-800"/> : pendingQuotesCount}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                <FileText className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">This month</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    {isLoading ?
                                        <Skeleton className="h-8 w-24 bg-slate-800"/> : formatCurrency(thisMonthValue)}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                <DollarSign className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Tasks due</p>
                                <h3 className="text-2xl font-bold text-white mt-1">0</h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
                                <Clock className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 bg-[#141124] border border-[#2e2c3a] shadow-sm">
                        <CardHeader
                            className="flex flex-row items-center justify-between pb-2 border-b border-[#2e2c3a]">
                            <div>
                                <CardTitle className="text-lg font-semibold text-white">Recent leads</CardTitle>
                                <p className="text-sm text-slate-400">Prioritize new and high urgency requests</p>
                            </div>
                            <Button variant="outline" size="sm"
                                    className="gap-2 text-white border-slate-700 hover:bg-slate-800 hover:text-white">
                                <Search className="h-4 w-4"/>
                                Search leads
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <SharedTable
                                columns={leadColumns}
                                isLoading={isLoading}
                                isEmpty={!isLoading && (!leads || leads.length === 0)}
                                className="rounded-none border-0"
                                headerClassName="bg-slate-900/50 border-slate-800 text-slate-400"
                                rowClassName="border-slate-800 hover:bg-slate-800/50 group text-slate-300"
                                emptyMessage="No leads found."
                            >
                                {isLoading ? (
                                    SKELETON_IDS.map((skelId) => (
                                        <TableRow key={skelId} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-20 ml-auto bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : leads?.map((lead) => (
                                    <TableRow key={lead.id} className="border-slate-800 hover:bg-slate-800/50 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                                                    {lead.userInfo.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div
                                                        className="font-medium text-white">{lead.userInfo}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Calendar
                                                            className="h-3 w-3"/> {new Date(lead.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-slate-300">{lead.propertyInfo}</div>
                                        </TableCell>
                                        <TableCell>
                                            {lead.status === 'NEW' ? (
                                                <Badge
                                                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none shadow-none">NEW</Badge>
                                            ) : (
                                                <Badge variant="outline"
                                                       className="text-slate-400 border-slate-700">{lead.status}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm"
                                                    onClick={() => openQuoteModal(lead.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-8">
                                                Quote
                                                <ArrowRight className="ml-1 h-3 w-3"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </SharedTable>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm">
                        <CardHeader className="pb-2 border-b border-[#2e2c3a]">
                            <CardTitle className="text-lg font-semibold text-white">Quote history</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[400px] overflow-y-auto">
                                <SharedTable
                                    columns={[
                                        {header: "ID", width: "20%"},
                                        {header: "Amount", width: "40%"},
                                        {header: "Status", width: "40%"}
                                    ]}
                                    isLoading={isLoading}
                                    isEmpty={!quotes || quotes.length === 0}
                                    className="rounded-none border-0"
                                    headerClassName="bg-slate-900/50 border-slate-800 text-slate-400 text-xs"
                                    rowClassName="border-slate-800 hover:bg-slate-800/50 text-slate-300 text-sm"
                                >
                                    {quotes?.map((quote) => (
                                        <TableRow key={quote.id} className="border-slate-800">
                                            <TableCell>{quote.id}</TableCell>
                                            <TableCell>{formatCurrency(quote.premium?.total || 0)}</TableCell>
                                            <TableCell>
                                                {/* @ts-expect-error - Backend DTO pending update */}
                                                <Badge variant={quote.status === 'ACCEPTED' ? 'default' : 'outline'}
                                                    // @ts-expect-error - Backend DTO pending update
                                                       className={quote.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}>
                                                    {/* @ts-expect-error - Backend DTO pending update */}
                                                    {quote.status || 'DRAFT'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </SharedTable>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
                <DialogContent
                    className="bg-slate-950 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Quote</DialogTitle>
                    </DialogHeader>
                    <QuoteForm
                        // @ts-expect-error - initialData partial match
                        initialData={initialQuoteData}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsQuoteOpen(false)}
                        isLoading={createMutation.isPending || updateMutation.isPending}
                        leads={quoteFormLeads}
                        hideAgentSelect={true}
                        agentId={agentId}
                    />
                </DialogContent>
            </Dialog>
        </AgentLayout>
    );
};

export default AgentDashboard;