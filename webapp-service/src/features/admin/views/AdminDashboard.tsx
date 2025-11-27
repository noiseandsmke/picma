import React from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchLeadStats, fetchLeadTrend} from '../services/leadService';
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from '@/components/ui/skeleton';
import {AlertTriangle, CheckCircle, FileText, XCircle} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const {data: stats, isLoading: isLoadingStats} = useQuery({
        queryKey: ['admin-stats'],
        queryFn: fetchLeadStats
    });

    const {data: trendData, isLoading: isLoadingTrend} = useQuery({
        queryKey: ['lead-trend'],
        queryFn: fetchLeadTrend
    });

    // Prepare chart data
    const inReviewCount = stats ? Math.max(0, stats.totalLeads - (stats.acceptedLeads + stats.rejectedLeads + stats.overdueLeads)) : 0;

    const statusData = [
        {name: 'Accepted', value: stats?.acceptedLeads || 0, color: '#32abb9'}, // Teal
        {name: 'In Review', value: inReviewCount, color: '#45b1fe'}, // Blue
        {name: 'Rejected', value: stats?.rejectedLeads || 0, color: '#ff692e'}, // Orange
        {name: 'Overdue', value: stats?.overdueLeads || 0, color: '#ac3cff'}, // Purple
    ].filter(item => item.value > 0);

    const lineChartData = React.useMemo(() => {
        const weeks = [
            {name: 'Week 1', thisMonth: 0, lastMonth: 0},
            {name: 'Week 2', thisMonth: 0, lastMonth: 0},
            {name: 'Week 3', thisMonth: 0, lastMonth: 0},
            {name: 'Week 4', thisMonth: 0, lastMonth: 0},
        ];

        if (!trendData || trendData.length === 0) return weeks;

        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();

        // Handle Previous Month Wrap-around (Jan -> Dec previous year)
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        trendData.forEach(item => {
            const d = new Date(item.date);
            const dMonth = d.getMonth();
            const dYear = d.getFullYear();
            const day = d.getDate();

            if (dYear === currentYear && dMonth === currentMonth) {
                if (day <= 7) weeks[0].thisMonth += item.count;
                else if (day <= 14) weeks[1].thisMonth += item.count;
                else if (day <= 21) weeks[2].thisMonth += item.count;
                else weeks[3].thisMonth += item.count;
            } else if (dYear === lastMonthYear && dMonth === lastMonth) {
                if (day <= 7) weeks[0].lastMonth += item.count;
                else if (day <= 14) weeks[1].lastMonth += item.count;
                else if (day <= 21) weeks[2].lastMonth += item.count;
                else weeks[3].lastMonth += item.count;
            }
        });

        return weeks;
    }, [trendData]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Cards Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-[#141124] border-[#2e2c3a] text-white overflow-hidden relative">
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#593bf2]/20 rounded-lg">
                                        <FileText className="h-5 w-5 text-[#593bf2]"/>
                                    </div>
                                    <span className="font-medium text-slate-300">Total Leads</span>
                                </div>
                            </div>
                            <div className="z-10 mt-4">
                                <div className="text-3xl font-bold text-white">
                                    {isLoadingStats ?
                                        <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.totalLeads ?? 0}
                                </div>
                            </div>
                            {/* Decorative blur effect */}
                            <div
                                className="absolute -top-10 -right-10 w-24 h-24 bg-[#593bf2] rounded-full blur-[60px] opacity-20"/>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#141124] border-[#2e2c3a] text-white overflow-hidden relative">
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#32abb9]/20 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-[#32abb9]"/>
                                    </div>
                                    <span className="font-medium text-slate-300">Accepted</span>
                                </div>
                            </div>
                            <div className="z-10 mt-4">
                                <div className="text-3xl font-bold text-white">
                                    {isLoadingStats ?
                                        <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.acceptedLeads ?? 0}
                                </div>
                            </div>
                            <div
                                className="absolute -top-10 -right-10 w-24 h-24 bg-[#32abb9] rounded-full blur-[60px] opacity-20"/>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#141124] border-[#2e2c3a] text-white overflow-hidden relative">
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#ff692e]/20 rounded-lg">
                                        <XCircle className="h-5 w-5 text-[#ff692e]"/>
                                    </div>
                                    <span className="font-medium text-slate-300">Rejected</span>
                                </div>
                            </div>
                            <div className="z-10 mt-4">
                                <div className="text-3xl font-bold text-white">
                                    {isLoadingStats ?
                                        <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.rejectedLeads ?? 0}
                                </div>
                            </div>
                            <div
                                className="absolute -top-10 -right-10 w-24 h-24 bg-[#ff692e] rounded-full blur-[60px] opacity-20"/>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#141124] border-[#2e2c3a] text-white overflow-hidden relative">
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-center z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#ac3cff]/20 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-[#ac3cff]"/>
                                    </div>
                                    <span className="font-medium text-slate-300">Overdue</span>
                                </div>
                            </div>
                            <div className="z-10 mt-4">
                                <div className="text-3xl font-bold text-white">
                                    {isLoadingStats ?
                                        <Skeleton className="h-8 w-16 bg-slate-800"/> : stats?.overdueLeads ?? 0}
                                </div>
                            </div>
                            <div
                                className="absolute -top-10 -right-10 w-24 h-24 bg-[#ac3cff] rounded-full blur-[60px] opacity-20"/>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-7">
                    {/* Total Leads by Month Chart (Line Chart) */}
                    <div className="col-span-4 bg-[#141124] border border-[#2e2c3a] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 bg-[#593bf2]/20 rounded-md flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-[#593bf2]"/>
                                </div>
                                <h3 className="font-semibold text-white">Total leads by month</h3>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <div className="flex items-center justify-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm bg-[#7a62f5]"/>
                                <span className="text-sm font-medium text-slate-300">This month</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm bg-[#ffa582]"/>
                                <span className="text-sm font-medium text-slate-300">Last month</span>
                            </div>
                        </div>

                        {isLoadingTrend ? (
                            <Skeleton className="h-[250px] w-full bg-slate-800"/>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={lineChartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e2c3a"/>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickCount={5}
                                    />
                                    <Tooltip
                                        cursor={{stroke: '#2e2c3a', strokeWidth: 2}}
                                        contentStyle={{
                                            backgroundColor: '#181624',
                                            borderColor: '#2e2c3a',
                                            color: '#fff',
                                            borderRadius: '8px'
                                        }}
                                        itemStyle={{color: '#fff'}}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="thisMonth"
                                        stroke="#7a62f5"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{r: 6, fill: '#7a62f5', stroke: '#141124', strokeWidth: 2}}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="lastMonth"
                                        stroke="#ffa582"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{r: 6, fill: '#ffa582', stroke: '#141124', strokeWidth: 2}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Leads by Status (Donut Chart) */}
                    <div className="col-span-3 bg-[#141124] border border-[#2e2c3a] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 bg-[#ac3cff]/20 rounded-md flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-[#ac3cff]"/>
                                </div>
                                <h3 className="font-semibold text-white">Leads by Status</h3>
                            </div>
                        </div>
                        <div className="flex items-center justify-center h-[284px] w-full">
                            {isLoadingStats ? (
                                <Skeleton className="h-[200px] w-[200px] rounded-full bg-slate-800"/>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#181624',
                                                borderColor: '#2e2c3a',
                                                color: '#fff',
                                                borderRadius: '8px'
                                            }}
                                            itemStyle={{color: '#fff'}}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value) => <span className="text-slate-300 ml-1">{value}</span>}
                                        />
                                        {/* Center Text for Donut Effect */}
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                                            <tspan x="50%" dy="-10" fontSize="24" fontWeight="bold" fill="#fff">
                                                {stats?.acceptedLeads ? `${Math.round((stats.acceptedLeads / (stats.totalLeads || 1)) * 100)}%` : '0%'}
                                            </tspan>
                                            <tspan x="50%" dy="20" fontSize="12" fill="#94a3b8">Accepted</tspan>
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;