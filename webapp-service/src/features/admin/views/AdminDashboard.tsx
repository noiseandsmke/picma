import React from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchLeadStats} from '../services/leadService';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from '@/components/ui/skeleton';
import {AlertTriangle, CheckCircle, FileText, TrendingUp, Users, XCircle} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const {data: stats, isLoading} = useQuery({
        queryKey: ['admin-stats'],
        queryFn: fetchLeadStats
    });

    const leadTrendData = [
        {name: 'Mon', newLeads: 4, processed: 3},
        {name: 'Tue', newLeads: 7, processed: 5},
        {name: 'Wed', newLeads: 5, processed: 6},
        {name: 'Thu', newLeads: 9, processed: 7},
        {name: 'Fri', newLeads: 12, processed: 10},
        {name: 'Sat', newLeads: 6, processed: 4},
        {name: 'Sun', newLeads: 3, processed: 2},
    ];

    const statusData = [
        {name: 'Accepted', value: stats?.acceptedLeads || 0, color: '#10b981'},
        {name: 'Rejected', value: stats?.rejectedLeads || 0, color: '#ef4444'},
        {name: 'Overdue', value: stats?.overdueLeads || 0, color: '#f59e0b'},
        {
            name: 'Active',
            value: (stats?.totalLeads || 0) - ((stats?.acceptedLeads || 0) + (stats?.rejectedLeads || 0) + (stats?.overdueLeads || 0)),
            color: '#3b82f6'
        },
    ];

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
                                {isLoading ? <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.totalLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500"/>
                                +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-950/20 border-emerald-900/50 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Accepted</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isLoading ? <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.acceptedLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Conversion
                                rate: {stats?.totalLeads ? Math.round((stats.acceptedLeads / stats.totalLeads) * 100) : 0}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-950/20 border-red-900/50 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {isLoading ? <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.rejectedLeads ?? 0}
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
                                {isLoading ? <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.overdueLeads ?? 0}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Action required</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Lead Acquisition Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={leadTrendData}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false}
                                           axisLine={false}/>
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false}
                                           tickFormatter={(value) => `${value}`}/>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#1e293b',
                                            color: '#f8fafc'
                                        }}
                                        itemStyle={{color: '#f8fafc'}}
                                    />
                                    <Area type="monotone" dataKey="newLeads" stroke="#6366f1" strokeWidth={2}
                                          fillOpacity={1} fill="url(#colorLeads)"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Lead Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color}/>
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#1e293b',
                                            color: '#f8fafc'
                                        }}
                                        itemStyle={{color: '#f8fafc'}}
                                    />
                                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
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

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Recent Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0"/>
                                    <div>
                                        <p className="text-sm font-medium text-white">High Error Rate</p>
                                        <p className="text-xs text-slate-400">Service 'property-quote' experiencing
                                            timeouts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0"/>
                                    <div>
                                        <p className="text-sm font-medium text-white">Backup Completed</p>
                                        <p className="text-xs text-slate-400">Daily database backup finished
                                            successfully.</p>
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