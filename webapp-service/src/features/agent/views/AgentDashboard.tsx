import React, {useMemo} from 'react';
import AgentLayout from '../layouts/AgentLayout';
import {ArrowRight, Bell, Calendar, Clock, DollarSign, FileText, Search, User} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from "@/components/ui/shared-table";
import {useQuery} from '@tanstack/react-query';
import {fetchAgentLeads, fetchAgentQuotes} from '../services/agentService';
import {Skeleton} from '@/components/ui/skeleton';
import {useAuth} from '@/context/AuthContext';
import {formatCurrency} from '@/lib/utils';

const AgentDashboard: React.FC = () => {
    const {user} = useAuth();
    const agentId = user?.id || '';

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

    const newLeadsCount = useMemo(() => leads?.filter(l => l.status === 'NEW').length || 0, [leads]);

    // We assume 'pending quotes' are those not accepted/rejected yet? Or maybe just total quotes?
    // AgentLeadAction might be relevant here but let's count quotes created this month or valid.
    // For now, let's use total count of quotes as a proxy or if status logic is available.
    // Assuming quotes returned are all relevant.
    const pendingQuotesCount = quotes?.length || 0;

    // Calculate "This Month" revenue or value. Assuming 'premium' is available in quote or sumInsured.
    // PropertyQuoteDto has 'premium' object with 'total'.
    const thisMonthValue = useMemo(() => {
        if (!quotes) return 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        return quotes.reduce((acc, q) => {
            // Assuming startDate indicates when it was quoted/sold
            if (q.startDate) {
                const d = new Date(q.startDate);
                if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
                    return acc + (q.premium?.total || 0);
                }
            }
            return acc;
        }, 0);
    }, [quotes]);

    const columns: Column[] = [
        {header: "Client", width: "25%"},
        {header: "Property", width: "35%"},
        {header: "Status", width: "15%"},
        {header: "Action", width: "25%", className: "text-right"}
    ];

    const isLoading = isLeadsLoading || isQuotesLoading;

    return (
        <AgentLayout>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">New Leads</p>
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
                                <p className="text-sm font-medium text-slate-400">Total Quotes</p>
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
                                <p className="text-sm font-medium text-slate-400">This Month</p>
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
                                <p className="text-sm font-medium text-slate-400">Tasks Due</p>
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
                                <CardTitle className="text-lg font-semibold text-white">Recent Leads</CardTitle>
                                <p className="text-sm text-slate-400">Prioritize new and high urgency requests</p>
                            </div>
                            <Button variant="outline" size="sm"
                                    className="gap-2 text-white border-slate-700 hover:bg-slate-800 hover:text-white">
                                <Search className="h-4 w-4"/>
                                Search Leads
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <SharedTable
                                columns={columns}
                                isLoading={isLoading}
                                isEmpty={!isLoading && (!leads || leads.length === 0)}
                                className="rounded-none border-0"
                                headerClassName="bg-slate-900/50 border-slate-800 text-slate-400"
                                rowClassName="border-slate-800 hover:bg-slate-800/50 group text-slate-300"
                                emptyMessage="No leads found."
                            >
                                {isLoading ? (
                                    Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={`lead-skel-${i}`} className="border-slate-800">
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
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-8">
                                                Quote
                                                <ArrowRight className="ml-1 h-3 w-3"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </SharedTable>
                            <div className="p-4 border-t border-[#2e2c3a] text-center">
                                <Button variant="ghost" size="sm"
                                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950">
                                    View All Leads
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-[#141124] border border-[#2e2c3a] shadow-sm">
                            <CardHeader className="pb-2 border-b border-[#2e2c3a]">
                                <CardTitle className="text-lg font-semibold text-white">Tasks</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div
                                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50">
                                    <Clock className="h-5 w-5 text-amber-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm font-medium text-amber-200">Follow up with Clark Kent</p>
                                        <p className="text-xs text-amber-400 mt-1">Quote sent 2 days ago. No
                                            response.</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                                    <User className="h-5 w-5 text-slate-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">Update Profile Info</p>
                                        <p className="text-xs text-slate-400 mt-1">License expires in 30
                                            days.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AgentLayout>
    );
};

export default AgentDashboard;