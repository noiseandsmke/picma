import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchAllLeads, LeadDto} from '../services/leadService';
import {fetchAllProperties} from '../services/propertyService';
import {fetchUsers} from '../services/userService';
import {cn} from '@/lib/utils';
import {TableCell, TableRow} from "@/components/ui/table";
import SharedTable, {Column} from '@/components/ui/shared-table';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Checkbox} from '@/components/ui/checkbox';
import {LEAD_STATUS_CONFIG} from '../utils/statusMapping';
import {LeadDetailDialog} from '@/features/admin/components/LeadDetailDialog';

const AdminLeadsView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});
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
        setSortConfig({key, direction});
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
        if (!userInfo) return {name: 'Unknown', details: ''};

        const parts = userInfo.split(' - ');
        if (parts.length >= 2) {
            return {
                name: parts[0],
                details: parts.slice(1).join(' • ')
            };
        }
        return {name: userInfo, details: ''};
    };

    const renderUserCell = (userInfo: string) => {
        const owner = owners?.find(u => u.id === userInfo);
        if (owner) {
            return (
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-white">{owner.firstName} {owner.lastName}</span>
                        <span className="text-xs text-slate-400">{owner.email}</span>
                    </div>
                </div>
            );
        }
        const {name, details} = parseUserInfo(userInfo);
        return (
            <div className="flex items-center gap-3">
                <div
                    className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-white">{name}</span>
                    <span className="text-xs text-slate-400">{details}</span>
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
                            className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700/50">
                            <span className="material-symbols-outlined text-[20px]">apartment</span>
                        </div>
                        <div className="flex flex-col">
                            <span
                                className="font-medium text-slate-200 line-clamp-1">{matchedProp.location.street}</span>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {matchedProp.location.city}, {matchedProp.location.ward}
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
                <span className="truncate max-w-[200px] text-slate-300" title={propertyInfoStr}>
                    {propertyInfoStr}
                </span>
            </div>
        );
    };

    const filteredLeads = leads?.filter(lead => {

        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(lead.status);

        return matchesStatus;
    });

    const columns: Column[] = [
        {
            header: (
                <div className="flex items-center gap-1">
                    ID {sortConfig.key === 'id' &&
                    <span className="material-symbols-outlined text-[16px]">unfold_more</span>}
                </div>
            ),
            width: "5%",
            onClick: () => handleSort('id'),
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    User Info {sortConfig.key === 'userInfo' &&
                    <span className="material-symbols-outlined text-[16px]">unfold_more</span>}
                </div>
            ),
            width: "25%",
            onClick: () => handleSort('userInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    Property address {sortConfig.key === 'propertyInfo' &&
                    <span className="material-symbols-outlined text-[16px]">unfold_more</span>}
                </div>
            ),
            width: "25%",
            onClick: () => handleSort('propertyInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => handleSort('status')}
                            className="h-auto p-0 font-normal hover:bg-transparent hover:text-white text-xs uppercase tracking-wider text-slate-400">
                        Status {sortConfig.key === 'status' &&
                        <span className="material-symbols-outlined text-[16px]">unfold_more</span>}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost"
                                    aria-label="Filter by status"
                                    className="h-6 w-6 p-0 hover:bg-slate-800 rounded-full relative ml-1">
                                <span
                                    className={cn("material-symbols-outlined text-[16px]", selectedStatuses.length > 0 ? "text-primary" : "text-slate-500")}>filter_list</span>
                                {selectedStatuses.length > 0 && (
                                    <span
                                        className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border-2 border-slate-900"/>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start"
                                             className="bg-slate-900 border-slate-700 text-slate-200 w-56">
                            <DropdownMenuLabel
                                className="text-xs font-normal text-slate-500 uppercase tracking-wider px-2 py-1.5">
                                Filter by status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5"/>

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
                                        className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
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
                                            className="border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn("h-2 w-2 rounded-full", config.dotClass)}/>
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
                    Created {sortConfig.key === 'createDate' &&
                    <span className="material-symbols-outlined text-[16px]">unfold_more</span>}
                </div>
            ),
            width: "15%",
            onClick: () => handleSort('createDate'),
        },
        {
            header: "",
            width: "5%",
            className: "text-right"
        }
    ];

    let content;
    if (isLeadsLoading) {
        content = [1, 2, 3, 4, 5].map((id) => (
            <TableRow key={`skeleton-${id}`} className="border-b border-slate-700/50">
                <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-slate-800"/>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24 bg-slate-800"/>
                            <Skeleton className="h-3 w-32 bg-slate-800"/>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg bg-slate-800"/>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32 bg-slate-800"/>
                            <Skeleton className="h-3 w-20 bg-slate-800"/>
                        </div>
                    </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                <TableCell><Skeleton className="h-8 w-8 bg-slate-800 ml-auto"/></TableCell>
            </TableRow>
        ));
    } else if (isLeadsError) {
        content = (
            <TableRow className="border-slate-700/50 hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center text-red-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">error</span>
                        <p>Failed to load leads data.</p>
                    </div>
                </TableCell>
            </TableRow>
        );
    } else {
        content = filteredLeads?.map((lead) => {
            const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.ACTIVE;
            return (
                <TableRow key={lead.id}
                          className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                    <TableCell className="font-medium text-slate-400">#{lead.id}</TableCell>
                    <TableCell className="py-3">
                        {renderUserCell(lead.userInfo)}
                    </TableCell>
                    <TableCell className="py-3">
                        {renderPropertyCell(lead.propertyInfo)}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline"
                               className={cn("border-0 font-medium px-2.5 py-0.5", statusConfig.className)}>
                            {statusConfig.label}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-600">event_busy</span>
                            {calculateExpiry(lead.createDate)}
                        </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-slate-600">schedule</span>
                            {formatDate(lead.createDate)}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost"
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800">
                                    <span className="sr-only">Open menu</span>
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end"
                                                 className="bg-slate-900 border-slate-700 text-slate-200">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="focus:bg-slate-800 focus:text-white cursor-pointer"
                                    onClick={() => handleViewDetail(lead)}
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-2">visibility</span>
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
            <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
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