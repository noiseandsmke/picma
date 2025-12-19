import React from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchLeadStats, fetchLeadTrend} from '../services/leadService';
import {fetchAllQuotes, fetchQuoteTrend} from '../services/quoteService';
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

    const {data: quotes, isLoading: isLoadingQuotes} = useQuery({
        queryKey: ['admin-quotes-stats'],
        queryFn: () => fetchAllQuotes()
    });

    const {data: quoteTrendData} = useQuery({
        queryKey: ['quote-trend'],
        queryFn: fetchQuoteTrend
    });

    const quoteStats = React.useMemo(() => {
        if (!quotes) return { total: 0, new: 0, accepted: 0, rejected: 0 };
        return {
            total: quotes.length,
            new: quotes.filter(q => q.status === 'NEW').length,
            accepted: quotes.filter(q => q.status === 'ACCEPTED').length,
            rejected: quotes.filter(q => q.status === 'REJECTED').length
        };
    }, [quotes]);

    const statusData = [
        {name: 'New', value: stats?.newLeads || 0, color: '#10b981'},
        {name: 'In Review', value: stats?.inReviewLeads || 0, color: '#f59e0b'},
        {name: 'Accepted', value: stats?.acceptedLeads || 0, color: '#3b82f6'}
    ].filter(item => item.value >= 0);

    const quoteStatusData = [
        {name: 'New', value: quoteStats.new, color: '#06b6d4', icon: 'fiber_new'},
        {name: 'Accepted', value: quoteStats.accepted, color: '#6366f1', icon: 'check_circle'},
        {name: 'Rejected', value: quoteStats.rejected, color: '#f43f5e', icon: 'cancel'}
    ];

    const chartData = React.useMemo(() => statusData.filter(item => item.value > 0), [statusData]);
    const quoteChartData = React.useMemo(() => quoteStatusData.filter(item => item.value > 0), [quoteStatusData]);

    const lineChartData = React.useMemo(() => {
        if (!trendData || trendData.length === 0) return [];

        const quoteMap = new Map(quoteTrendData?.map((q: any) => [q.date, q.count]) || []);

        const sortedData = [...trendData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return sortedData.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            leadCount: item.count,
            quoteCount: quoteMap.get(item.date) || 0
        }));
    }, [trendData, quoteTrendData]);


    const StatsCard = ({title, value, colorClass, icon, bgClass, overlayClass, loading}: any) => (
        <div
            className="relative overflow-hidden flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-sm group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${bgClass} ${colorClass} group-hover:bg-opacity-30 transition-colors`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
            </div>
            
            <h3 className="text-white text-3xl font-bold">
                 {loading ? <Skeleton className="h-8 w-16 bg-slate-800"/> : value}
            </h3>

            <div
                className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-xl group-hover:opacity-20 transition-opacity ${overlayClass} opacity-10 pointer-events-none`}></div>
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
                        loading={isLoadingStats}
                    />
                    <StatsCard
                        title="New"
                        value={stats?.newLeads || 0}
                        icon="fiber_new"
                        colorClass="text-emerald-500"
                        bgClass="bg-emerald-500/10"
                        overlayClass="bg-emerald-500"
                        loading={isLoadingStats}
                    />
                    <StatsCard
                        title="In Review"
                        value={stats?.inReviewLeads || 0}
                        icon="hourglass_empty"
                        colorClass="text-amber-500"
                        bgClass="bg-amber-500/10"
                        overlayClass="bg-amber-500"
                        loading={isLoadingStats}
                    />
                    <StatsCard
                        title="Accepted"
                        value={stats?.acceptedLeads || 0}
                        icon="check_circle"
                        colorClass="text-blue-500"
                        bgClass="bg-blue-500/10"
                        overlayClass="bg-blue-500"
                        loading={isLoadingStats}
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
                                <h3 className="text-white text-base font-semibold">Trend for last week</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-primary shadow-glow"></div>
                                    <span className="text-xs text-slate-400">Total Leads</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-violet-500 shadow-glow"></div>
                                    <span className="text-xs text-slate-400">Total Quotes</span>
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
                                            allowDecimals={false}
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
                                            dataKey="leadCount"
                                            stroke="#3b82f6" strokeWidth={3}
                                            dot={{r: 4, fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2}}
                                            activeDot={{r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2}}
                                            fill="url(#colorThisMonth)"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="quoteCount"
                                            stroke="#8b5cf6" strokeWidth={3}
                                            dot={{r: 4, fill: '#0f172a', stroke: '#8b5cf6', strokeWidth: 2}}
                                            activeDot={{r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2}}
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
                            <h3 className="text-white text-base font-semibold">Status by percentage</h3>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center relative py-4">
                            {isLoadingStats ? (
                                <Skeleton className="h-[200px] w-[200px] rounded-full bg-slate-800"/>
                            ) : (
                                <>
                                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                                        {statusData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full"
                                                     style={{backgroundColor: entry.color}}></div>
                                                <span className="text-sm text-slate-400">
                                                    {`${Math.round((entry.value / (stats?.totalLeads || 1)) * 100)}%`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative w-full h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={75}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                                ))}
                                            </Pie>
                                            <Pie
                                                data={quoteChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={85}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {quoteChartData.map((entry, index) => (
                                                    <Cell key={`cell-quote-${index}`} fill={entry.color}/>
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {quoteStatusData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></div>
                                                <span className="text-sm text-slate-400">
                                                    {`${Math.round((entry.value / (quoteStats.total || 1)) * 100)}%`}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Quotes"
                        value={quoteStats.total}
                        icon="assignment"
                        colorClass="text-violet-500"
                        bgClass="bg-violet-500/10"
                        overlayClass="bg-violet-500"
                        loading={isLoadingQuotes}
                    />
                    <StatsCard
                        title="New"
                        value={quoteStats.new}
                        icon="fiber_new"
                        colorClass="text-cyan-500"
                        bgClass="bg-cyan-500/10"
                        overlayClass="bg-cyan-500"
                        loading={isLoadingQuotes}
                    />
                    <StatsCard
                        title="Accepted"
                        value={quoteStats.accepted}
                        icon="check_circle"
                        colorClass="text-indigo-500"
                        bgClass="bg-indigo-500/10"
                        overlayClass="bg-indigo-500"
                        loading={isLoadingQuotes}
                    />
                    <StatsCard
                        title="Rejected"
                        value={quoteStats.rejected}
                        icon="cancel"
                        colorClass="text-rose-500"
                        bgClass="bg-rose-500/10"
                        overlayClass="bg-rose-500"
                        loading={isLoadingQuotes}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;