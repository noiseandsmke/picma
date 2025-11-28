import React, {useState} from 'react';
import AgentLayout from '../layouts/AgentLayout';
import {ArrowRight, Bell, Calendar, Clock, DollarSign, FileText, Search, User} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useQuery} from '@tanstack/react-query';
import {fetchAgentLeads} from '../services/agentService';
import {Skeleton} from '@/components/ui/skeleton';

const AgentDashboard: React.FC = () => {
    const [agentId] = useState('agent123');

    const {data: leads, isLoading} = useQuery({
        queryKey: ['agent-leads', agentId],
        queryFn: () => fetchAgentLeads(agentId)
    });

    return (
        <AgentLayout>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">New Leads</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                    {isLoading ? <Skeleton
                                        className="h-8 w-12"/> : leads?.filter(l => l.status === 'NEW').length || 0}
                                </h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <Bell className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Pending Quotes</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">5</h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <FileText className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">This Month</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">$4,250</h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <DollarSign className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Tasks Due</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">3</h3>
                            </div>
                            <div
                                className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <Clock className="h-5 w-5"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                        <CardHeader
                            className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-800">Recent Leads</CardTitle>
                                <p className="text-sm text-slate-500">Prioritize new and high urgency requests</p>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                                <Search className="h-4 w-4"/>
                                Search Leads
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-100">
                                        <TableHead className="w-[200px]">Client</TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({length: 3}).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-32"/></TableCell>
                                                <TableCell><Skeleton className="h-4 w-48"/></TableCell>
                                                <TableCell><Skeleton className="h-6 w-16"/></TableCell>
                                                <TableCell><Skeleton className="h-8 w-20 ml-auto"/></TableCell>
                                            </TableRow>
                                        ))
                                    ) : leads?.map((lead) => (
                                        <TableRow key={lead.id} className="border-slate-100 hover:bg-slate-50/50 group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                                                        {lead.userInfo.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div
                                                            className="font-medium text-slate-900">{lead.userInfo}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Calendar
                                                                className="h-3 w-3"/> {new Date(lead.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-slate-700">{lead.propertyInfo}</div>
                                            </TableCell>
                                            <TableCell>
                                                {lead.status === 'NEW' ? (
                                                    <Badge
                                                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none">NEW</Badge>
                                                ) : (
                                                    <Badge variant="outline"
                                                           className="text-slate-500 border-slate-200">{lead.status}</Badge>
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
                                </TableBody>
                            </Table>
                            <div className="p-4 border-t border-slate-100 text-center">
                                <Button variant="ghost" size="sm"
                                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                    View All Leads
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader className="pb-2 border-b border-slate-100">
                                <CardTitle className="text-lg font-semibold text-slate-800">Tasks</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div
                                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                                    <Clock className="h-5 w-5 text-amber-600 mt-0.5"/>
                                    <div>
                                        <p className="text-sm font-medium text-amber-900">Follow up with Clark Kent</p>
                                        <p className="text-xs text-amber-700 mt-1">Quote sent 2 days ago. No
                                            response.</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <User className="h-5 w-5 text-slate-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Update Profile Info</p>
                                        <p className="text-xs text-slate-500 mt-1">License expires in 30
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