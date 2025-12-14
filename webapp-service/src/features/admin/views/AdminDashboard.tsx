import React from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchLeadStats, fetchLeadTrend} from '../services/leadService';
import {
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {Skeleton} from '@/components/ui/skeleton';

const AdminDashboard: React.FC = () => {
    const {data: stats, isLoading: isLoadingStats} = useQuery({
        queryKey: ['admin-stats'],
        queryFn: fetchLeadStats
    });

    const {data: trendData, isLoading: isLoadingTrend} = useQuery({
        queryKey: ['lead-trend'],
        queryFn: fetchLeadTrend
    });

    const statusData = [
        {name: 'Accepted', value: stats?.acceptedLeads || 0, color: '#3b82f6'}, {
            name: 'In review',
            value: Math.max(0, (stats?.totalLeads || 0) - ((stats?.acceptedLeads || 0) + (stats?.rejectedLeads || 0) + (stats?.overdueLeads || 0))),
            color: '#f59e0b'
        }, {name: 'Rejected', value: stats?.rejectedLeads || 0, color: '#ef4444'}, {
            name: 'Overdue',
            value: stats?.overdueLeads || 0,
            color: '#10b981'
        },].filter(item => item.value > 0);

    const lineChartData = React.useMemo(() => {
        const weeks = [
            {name: 'Week 1', thisMonth: 0, lastMonth: 0},
            {name: 'Week 2', thisMonth: 0, lastMonth: 0},
            {name: 'Week 3', thisMonth: 0, lastMonth: 0},
            {name: 'Week 4', thisMonth: 0, lastMonth: 0},
        ];

        if (!trendData || trendData.length === 0) return weeks;

        return weeks;
    }, [trendData]);


    const StatsCard = ({title, value, colorClass, icon, bgClass, overlayClass}: any) => (
        <div
            className="relative overflow-hidden flex flex-col gap-4 rounded-xl p-6 bg-slate-900 border border-slate-800 shadow-sm group hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${bgClass} ${colorClass} group-hover:bg-opacity-30 transition-colors`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-white text-3xl font-bold mt-1">
                    {isLoadingStats ? <Skeleton className="h-8 w-16 bg-slate-800"/> : value}
                </h3>
            </div>
            <div
                className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-xl group-hover:opacity-20 transition-opacity ${overlayClass} opacity-10`}></div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="max-w-[1600px] flex flex-col gap-6 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total leads"
                        value={stats?.totalLeads || 0}
                        icon="description"
                        colorClass="text-primary"
                        bgClass="bg-primary/10"
                        overlayClass="bg-primary"
                    />
                    <StatsCard
                        title="Accepted"
                        value={stats?.acceptedLeads || 0}
                        icon="check_circle"
                        colorClass="text-emerald-500"
                        bgClass="bg-emerald-500/10"
                        overlayClass="bg-emerald-500"
                    />
                    <StatsCard
                        title="Rejected"
                        value={stats?.rejectedLeads || 0}
                        icon="cancel"
                        colorClass="text-rose-500"
                        bgClass="bg-rose-500/10"
                        overlayClass="bg-rose-500"
                    />
                    <StatsCard
                        title="Overdue"
                        value={stats?.overdueLeads || 0}
                        icon="warning"
                        colorClass="text-amber-500"
                        bgClass="bg-amber-500/10"
                        overlayClass="bg-amber-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div
                        className="lg:col-span-2 flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-1.5 rounded text-primary">
                                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                                </div>
                                <h3 className="text-white text-base font-semibold">Total leads by month</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-primary shadow-glow"></div>
                                    <span className="text-xs text-slate-400">This month</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-orange-400"></div>
                                    <span className="text-xs text-slate-400">Last month</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-[280px] mt-auto">
                            {isLoadingTrend ? (
                                <Skeleton className="h-full w-full bg-slate-800 rounded-lg"/>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineChartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                        <defs>
                                            <linearGradient id="colorThisMonth" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155"
                                                       opacity={0.5}/>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#334155',
                                                color: '#f8fafc',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
                                            }}
                                            itemStyle={{color: '#fff'}}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="lastMonth"
                                            stroke="#fb923c" strokeWidth={2}
                                            dot={false}
                                            strokeOpacity={0.5}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="thisMonth"
                                            stroke="#3b82f6" strokeWidth={3}
                                            dot={{r: 4, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2}}
                                            activeDot={{r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2}}
                                            fill="url(#colorThisMonth)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/10 p-1.5 rounded text-primary">
                                <span className="material-symbols-outlined text-[20px]">donut_large</span>
                            </div>
                            <h3 className="text-white text-base font-semibold">Leads by status</h3>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center relative py-4">
                            {isLoadingStats ? (
                                <Skeleton className="h-[200px] w-[200px] rounded-full bg-slate-800"/>
                            ) : (
                                <div className="relative w-full h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div
                                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-4xl font-bold text-white tracking-tight">
                                            {stats?.acceptedLeads ? `${Math.round((stats.acceptedLeads / (stats.totalLeads || 1)) * 100)}%` : '0%'}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium mt-1">Accepted</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm mt-2">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-white text-base font-semibold">Recent activity</h3>
                        <a href="#"
                           className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">View
                            all</a>
                    </div>
                    <div>
                        <table className="w-full text-left border-collapse table-fixed">
                            <colgroup>
                                <col style={{width: '25%'}}/>
                                <col style={{width: '40%'}}/>
                                <col style={{width: '20%'}}/>
                                <col style={{width: '15%'}}/>
                            </colgroup>
                            <thead className="bg-transparent">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                                    No recent activity to display.
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;