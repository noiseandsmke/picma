import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import { fetchAllLeads, LeadDto } from '../services/leadService';
import { fetchAllProperties } from '../services/propertyService';
import { fetchUsers } from '../services/userService';
import {
    ArrowUpDown,
    Building2,
    Calendar,
    Clock,
    Eye,
    Filter,
    MapPin,
    MoreHorizontal,
    Search,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableCell, TableRow } from "@/components/ui/table";
import SharedTable, { Column } from '@/components/ui/shared-table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { LEAD_STATUS_CONFIG } from '../utils/statusMapping';
import { LeadDetailDialog } from '@/features/admin/components/LeadDetailDialog';

const AdminLeadsView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const {
        data: properties,
    } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: () => fetchAllProperties(),
    });

    const {
        data: owners,
    } = useQuery({
        queryKey: ['admin-owners'],
        queryFn: () => fetchUsers('owner'),
    });

    const {
        data: leads,
        isLoading: isLeadsLoading,
        isError: isLeadsError
    } = useQuery({
        queryKey: ['admin-leads', sortConfig],
        queryFn: () => fetchAllLeads(sortConfig.key, sortConfig.direction),
    });

    const handleViewDetail = (lead: LeadDto) => {
        setSelectedLead(lead);
        setIsDetailOpen(true);
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev => {
            if (prev.includes(status)) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    const calculateExpiry = (createDate: string) => {
        try {
            const date = new Date(createDate);
            date.setDate(date.getDate() + 30);
            return date.toLocaleDateString();
        } catch {
            return '-';
        }
    };

    const parseUserInfo = (userInfo: string) => {
        if (!userInfo) return { name: 'Unknown', details: '' };

        const parts = userInfo.split(' - ');
        if (parts.length >= 2) {
            return {
                name: parts[0],
                details: parts.slice(1).join(' • ')
            };
        }
        return { name: userInfo, details: '' };
    };

    const renderUserCell = (userInfo: string) => {
        const owner = owners?.find(u => u.id === userInfo);
        if (owner) {
            return (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{owner.firstName} {owner.lastName}</span>
                        <span className="text-xs text-slate-500">{owner.email}</span>
                    </div>
                </div>
            );
        }
        const { name, details } = parseUserInfo(userInfo);
        return (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <User size={14} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{name}</span>
                    <span className="text-xs text-slate-500">{details}</span>
                </div>
            </div>
        );
    };

    const renderPropertyCell = (propertyInfoStr: string) => {
        if (Array.isArray(properties) && properties.length > 0) {
            const matchedProp = properties.find(p => String(p.id) === String(propertyInfoStr));
            if (matchedProp) {
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                            <div
                                className="font-medium text-slate-200">{matchedProp.location.street}, {matchedProp.location.ward}, {matchedProp.location.city}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {matchedProp.location.city}
                            </div>
                        </div>
                    </div>
                );
            }
        }

        try {
            const obj = JSON.parse(propertyInfoStr);
            if (obj?.address) {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-200 truncate">{obj.address}</span>
                        <span className="text-xs text-slate-500 truncate">{obj.city}</span>
                    </div>
                );
            }
        } catch {
        }

        return (
            <div className="flex items-center gap-2">
                <span className="truncate max-w-[200px]" title={propertyInfoStr}>
                    {propertyInfoStr}
                </span>
            </div>
        );
    };

    const filteredLeads = leads?.filter(lead => {
        let searchableText = lead.userInfo;
        const owner = owners?.find(u => u.id === lead.userInfo);
        if (owner) {
            searchableText = `${owner.firstName} ${owner.lastName} ${owner.email} ${owner.mobile || ''}`;
        }

        const matchesSearch =
            searchableText.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(lead.id).includes(searchTerm);

        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(lead.status);

        return matchesSearch && matchesStatus;
    });

    const columns: Column[] = [
        {
            header: (
                <div className="flex items-center gap-1">
                    ID {sortConfig.key === 'id' && <ArrowUpDown size={14} />}
                </div>
            ),
            width: "5%",
            onClick: () => handleSort('id'),
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    User Info {sortConfig.key === 'userInfo' && <ArrowUpDown size={14} />}
                </div>
            ),
            width: "25%",
            onClick: () => handleSort('userInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    Property address {sortConfig.key === 'propertyInfo' && <ArrowUpDown size={14} />}
                </div>
            ),
            width: "25%",
            onClick: () => handleSort('propertyInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => handleSort('status')}
                        className="h-auto p-0 font-normal hover:bg-transparent hover:text-inherit">
                        Status {sortConfig.key === 'status' && <ArrowUpDown size={14} />}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost"
                                aria-label="Filter by status"
                                className="h-6 w-6 p-0 hover:bg-slate-800 rounded-full relative">
                                <Filter
                                    className={cn("h-3 w-3", selectedStatuses.length > 0 ? "text-indigo-400" : "text-slate-500")} />
                                {selectedStatuses.length > 0 && (
                                    <span
                                        className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 border border-slate-900" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start"
                            className="bg-slate-900 border-slate-800 text-slate-200 w-56">
                            <DropdownMenuLabel
                                className="text-xs font-normal text-slate-500 uppercase tracking-wider px-2 py-1.5">
                                Filter by status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />

                            <DropdownMenuItem
                                className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedStatuses([]);
                                }}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Checkbox
                                        checked={selectedStatuses.length === 0}
                                        className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 pointer-events-none"
                                    />
                                    <span className="text-sm">All Statuses</span>
                                </div>
                            </DropdownMenuItem>

                            {Object.values(LEAD_STATUS_CONFIG).map((config) => (
                                <DropdownMenuItem
                                    key={config.value}
                                    className="focus:bg-slate-800 focus:text-white cursor-pointer py-2 px-2"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        toggleStatus(config.value);
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <Checkbox
                                            checked={selectedStatuses.includes(config.value)}
                                            className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 pointer-events-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn("h-2 w-2 rounded-full", config.dotClass)} />
                                            <span className="text-sm">{config.label}</span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            width: "15%",
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    Expires at
                </div>
            ),
            width: "10%",
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    Created {sortConfig.key === 'createDate' && <ArrowUpDown size={14} />}
                </div>
            ),
            width: "15%",
            onClick: () => handleSort('createDate'),
        },
        {
            header: "Actions",
            width: "5%",
        }
    ];

    let content;
    if (isLeadsLoading) {
        content = [1, 2, 3, 4, 5].map((id) => (
            <TableRow key={`skeleton-${id}`} className="border-slate-800">
                <TableCell><Skeleton className="h-4 w-8 bg-slate-800" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32 bg-slate-800" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48 bg-slate-800" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 bg-slate-800" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 bg-slate-800" /></TableCell>
            </TableRow>
        ));
    } else if (isLeadsError) {
        content = (
            <TableRow className="border-slate-800">
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-400">
                    Failed to load leads data.
                </TableCell>
            </TableRow>
        );
    } else {
        content = filteredLeads?.map((lead) => {
            const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.ACTIVE;
            return (
                <TableRow key={lead.id}
                    className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-medium text-slate-300">{lead.id}</TableCell>
                    <TableCell className="text-slate-300">
                        {renderUserCell(lead.userInfo)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                        {renderPropertyCell(lead.propertyInfo)}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline"
                            className={cn("border-0 font-medium", statusConfig.className)}>
                            {statusConfig.label}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-slate-600" />
                            {calculateExpiry(lead.createDate)}
                        </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-slate-600" />
                            {formatDate(lead.createDate)}
                        </div>
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end"
                                className="bg-slate-900 border-slate-800 text-slate-200">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="focus:bg-slate-800 focus:text-white cursor-pointer"
                                    onClick={() => handleViewDetail(lead)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View lead details
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            );
        });
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex flex-col space-y-4 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <h3 className="font-semibold text-lg text-white">All Leads</h3>
                                <p className="text-sm text-slate-400">Manage and track all insurance leads.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 p-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Search by name, phone or ID..."
                                className="pl-9 bg-slate-900 border-slate-700 focus-visible:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <SharedTable
                        columns={columns}
                        isLoading={isLeadsLoading}
                        isEmpty={!isLeadsLoading && !isLeadsError && (!filteredLeads || filteredLeads.length === 0)}
                        emptyMessage="No leads found matching your criteria."
                    >
                        {content}
                    </SharedTable>
                </div>
            </div>

            {selectedLead && (
                <LeadDetailDialog
                    open={isDetailOpen}
                    onOpenChange={setIsDetailOpen}
                    lead={selectedLead}
                />
            )}
        </AdminLayout>
    );
};

export default AdminLeadsView;