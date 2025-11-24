import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {ChevronDown, FileCheck, FileClock, FileText, FileX, Filter, Search} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-8 max-w-[1600px] mx-auto">

                {/* Top Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Leads */}
                    <Card
                        className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-none text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <FileText className="h-24 w-24 -mr-6 -mt-6"/>
                        </div>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileText className="h-5 w-5 text-white"/>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold mt-2">86</div>
                            <CardTitle className="text-sm font-medium text-indigo-100 mt-1">Total Leads</CardTitle>
                        </CardContent>
                    </Card>

                    {/* Card 2: Accepted Leads */}
                    <Card className="bg-teal-600 border-none text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <FileCheck className="h-24 w-24 -mr-6 -mt-6"/>
                        </div>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileCheck className="h-5 w-5 text-white"/>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold mt-2">25</div>
                            <CardTitle className="text-sm font-medium text-teal-100 mt-1">Accepted Leads</CardTitle>
                        </CardContent>
                    </Card>

                    {/* Card 3: Rejected Leads */}
                    <Card className="bg-purple-700 border-none text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <FileX className="h-24 w-24 -mr-6 -mt-6"/>
                        </div>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileX className="h-5 w-5 text-white"/>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold mt-2">40</div>
                            <CardTitle className="text-sm font-medium text-purple-100 mt-1">Rejected Leads</CardTitle>
                        </CardContent>
                    </Card>

                    {/* Card 4: Overdue Leads */}
                    <Card className="bg-orange-600 border-none text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <FileClock className="h-24 w-24 -mr-6 -mt-6"/>
                        </div>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FileClock className="h-5 w-5 text-white"/>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold mt-2">22</div>
                            <CardTitle className="text-sm font-medium text-orange-100 mt-1">Overdue Leads</CardTitle>
                        </CardContent>
                    </Card>
                </div>

                {/* Leads List Table Section */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                    {/* Table Header & Filters */}
                    <div
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
                        <h2 className="text-lg font-semibold text-white">Leads List</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search..."
                                    className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-600"
                                />
                            </div>
                            <Button variant="outline"
                                    className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                All ZipCode <ChevronDown className="ml-2 h-4 w-4"/>
                            </Button>
                            <Button variant="outline" size="icon"
                                    className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs uppercase bg-slate-900 text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4 w-12">
                                    <Checkbox
                                        className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"/>
                                </th>
                                <th className="px-6 py-4">Lead Name</th>
                                <th className="px-6 py-4">Started Date</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                            {[
                                {
                                    name: "Robert Fox",
                                    date: "Dec 12, 2024",
                                    assigned: ["JD"],
                                    due: "Dec 15, 2024",
                                    status: "Active",
                                    statusColor: "text-emerald-400 bg-emerald-400/10"
                                },
                                {
                                    name: "Cody Fisher",
                                    date: "Dec 10, 2024",
                                    assigned: ["MK", "AL"],
                                    due: "Dec 14, 2024",
                                    status: "Expired",
                                    statusColor: "text-slate-400 bg-slate-400/10"
                                },
                                {
                                    name: "Esther Howard",
                                    date: "Dec 10, 2024",
                                    assigned: ["JD"],
                                    due: "Dec 14, 2024",
                                    status: "Accepted",
                                    statusColor: "text-blue-400 bg-blue-400/10"
                                },
                                {
                                    name: "Jenny Wilson",
                                    date: "Dec 08, 2024",
                                    assigned: [],
                                    due: "Dec 12, 2024",
                                    status: "Rejected",
                                    statusColor: "text-red-400 bg-red-400/10"
                                },
                                {
                                    name: "Guy Hawkins",
                                    date: "Dec 08, 2024",
                                    assigned: ["MK"],
                                    due: "Dec 12, 2024",
                                    status: "Active",
                                    statusColor: "text-emerald-400 bg-emerald-400/10"
                                },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4">
                                        <Checkbox
                                            className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"/>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-200">{row.name}</td>
                                    <td className="px-6 py-4">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {row.assigned.length > 0 ? row.assigned.map((initials, idx) => (
                                                <div key={idx}
                                                     className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-900 ring-2 ring-slate-950 text-xs font-medium text-indigo-200">
                                                    {initials}
                                                </div>
                                            )) : <span className="text-xs italic text-slate-600">Unassigned</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{row.due}</td>
                                    <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusColor}`}>
                                                {row.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
                        Showing 5 of 86 leads
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;