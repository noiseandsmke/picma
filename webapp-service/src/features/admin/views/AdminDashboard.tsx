import React from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchLeadStats, fetchLeadTrend} from '../services/leadService';
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from '@/components/ui/skeleton';
import {AlertTriangle, CheckCircle, FileText, Users, XCircle} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const {data: stats, isLoading: isLoadingStats} = useQuery({
        queryKey: ['admin-stats'],
        queryFn: fetchLeadStats
    });

    const {data: trendData, isLoading: isLoadingTrend} = useQuery({
        queryKey: ['lead-trend'],
        queryFn: fetchLeadTrend
    });

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-indigo-950/20 border-indigo-900/50 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Leads</CardTitle>
                            <FileText className="h-4 w-4 text-indigo-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isLoadingStats ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.totalLeads ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-950/20 border-emerald-900/50 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Accepted</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isLoadingStats ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.acceptedLeads ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-950/20 border-red-900/50 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isLoadingStats ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.rejectedLeads ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-950/20 border-amber-900/50 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isLoadingStats ?
                                    <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.overdueLeads ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-7 bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Lead Acquisition Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTrend ? (
                                <Skeleton className="h-[350px] w-full bg-slate-800"/>
                            ) : (
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                        <XAxis dataKey="date" stroke="#9ca3af"/>
                                        <YAxis stroke="#9ca3af"/>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#1e293b'
                                            }}
                                        />
                                        <Legend/>
                                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Leads"/>
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center py-8">
                                <Users className="h-16 w-16 text-slate-700"/>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">1,240</p>
                                <p className="text-sm text-slate-400">Total registered users</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-base">System Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">API Latency</span>
                                        <span className="text-emerald-400 font-medium">45ms</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[15%]"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Database Load</span>
                                        <span className="text-blue-400 font-medium">24%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[24%]"/>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Memory Usage</span>
                                        <span className="text-purple-400 font-medium">60%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[60%]"/>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;