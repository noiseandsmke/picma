import React from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchAllLeads, fetchLeadStats} from '../services/leadService';
import {AlertTriangle, Building2, CheckCircle, Clock, FileText, XCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';

const AdminDashboard: React.FC = () => {
    const {
        data: stats,
        isLoading: isStatsLoading
    } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: fetchLeadStats
    });

    const {
        data: leads,
        isLoading: isLeadsLoading,
        isError: isLeadsError
    } = useQuery({
        queryKey: ['admin-leads'],
        queryFn: fetchAllLeads
    });

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20';
            case 'ACCEPTED':
                return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20';
            case 'EXPIRED':
                return 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400';
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Leads</CardTitle>
                            <FileText className="h-4 w-4 text-blue-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isStatsLoading ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.totalLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Accepted</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isStatsLoading ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.acceptedLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Conversion
                                rate: {stats && stats.totalLeads > 0 ? Math.round((stats.acceptedLeads / stats.totalLeads) * 100) : 0}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isStatsLoading ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.rejectedLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Requires attention
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Overdue / Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isStatsLoading ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.overdueLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                System health check
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">Recent Leads</h3>
                            <p className="text-sm text-slate-400">Latest insurance leads entering the system.</p>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search Property..."
                                className="bg-slate-900 border border-slate-700 text-sm rounded-md px-3 py-1.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="text"
                                placeholder="Search Owner..."
                                className="bg-slate-900 border border-slate-700 text-sm rounded-md px-3 py-1.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50 border-slate-800">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400 w-[80px]">ID</TableHead>
                                    <TableHead className="text-slate-400">User Info</TableHead>
                                    <TableHead className="text-slate-400">Property Info</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400">Created</TableHead>
                                    <TableHead className="text-slate-400">Expiry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLeadsLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isLeadsError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="h-24 text-center text-red-400">
                                            Failed to load leads data.
                                        </TableCell>
                                    </TableRow>
                                ) : leads && leads.length > 0 ? (
                                    leads.map((lead) => (
                                        <TableRow key={lead.id}
                                                  className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium text-slate-300">#{lead.id}</TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-indigo-400">{lead.userInfo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3 w-3 text-slate-500"/>
                                                    {lead.propertyInfo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline"
                                                       className={cn("border-0 font-medium", getStatusClass(lead.status))}>
                                                    {lead.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-slate-600"/>
                                                    {formatDate(lead.startDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="text-slate-400 text-sm">{formatDate(lead.expiryDate)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No active leads found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;