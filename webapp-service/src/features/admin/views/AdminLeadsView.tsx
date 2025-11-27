import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchAllLeads} from '../services/leadService';
import {ArrowUpDown, Building2, Clock} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';

const AdminLeadsView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});

    const {
        data: leads,
        isLoading: isLeadsLoading,
        isError: isLeadsError
    } = useQuery({
        queryKey: ['admin-leads', sortConfig],
        queryFn: () => fetchAllLeads(sortConfig.key, sortConfig.direction),
    });

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

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
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Table Section */}
                <div className="rounded-xl border border-[#2e2c3a] bg-[#141124] text-slate-200 overflow-hidden">
                    <div className="p-6 flex items-center justify-between border-b border-[#2e2c3a]">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">All Leads</h3>
                            <p className="text-sm text-slate-400">Manage and track all insurance leads.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-[#2a2736]/50 border border-[#2e2c3a] text-sm rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#593bf2] w-64"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-[#2a2736]/30 border-[#2e2c3a]">
                                <TableRow className="border-[#2e2c3a] hover:bg-[#2a2736]/50">
                                    <TableHead className="text-slate-400 w-[80px] cursor-pointer"
                                               onClick={() => handleSort('id')}>
                                        <div className="flex items-center gap-1">
                                            ID {sortConfig.key === 'id' &&
                                            <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('userInfo')}>
                                        <div className="flex items-center gap-1">
                                            User Info {sortConfig.key === 'userInfo' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('propertyInfo')}>
                                        <div className="flex items-center gap-1">
                                            Property Info {sortConfig.key === 'propertyInfo' &&
                                            <ArrowUpDown size={14}/>}
                                        </div>

                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">
                                            Status {sortConfig.key === 'status' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('startDate')}>
                                        <div className="flex items-center gap-1">
                                            Created {sortConfig.key === 'startDate' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('expiryDate')}>
                                        <div className="flex items-center gap-1">
                                            Expiry {sortConfig.key === 'expiryDate' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLeadsLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-[#2e2c3a]">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isLeadsError ? (
                                    <TableRow className="border-[#2e2c3a]">
                                        <TableCell colSpan={6} className="h-24 text-center text-red-400">
                                            Failed to load leads data.
                                        </TableCell>
                                    </TableRow>
                                ) : leads && leads.length > 0 ? (
                                    leads.map((lead) => (
                                        <TableRow key={lead.id}
                                                  className="border-[#2e2c3a] hover:bg-[#2a2736]/30 transition-colors">
                                            <TableCell className="font-medium text-slate-300">{lead.id}</TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#45b1fe]">{lead.userInfo}</span>
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
                                    <TableRow className="border-[#2e2c3a]">
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

export default AdminLeadsView;