import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {fetchAllLeads, PropertyLeadDto} from '../services/leadService';
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
import {Building2, Eye, Info, ListFilter, MapPin, User} from 'lucide-react';

const AdminLeadsView: React.FC = () => {
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<PropertyLeadDto | null>(null);
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
        queryKey: ['admin-leads', sortConfig, selectedStatus],
        queryFn: () => {
            const sortBy = sortConfig.key === 'propertyInfo' ? 'zipCode' : sortConfig.key;
            return fetchAllLeads(sortBy, sortConfig.direction, selectedStatus || undefined);
        },
    });

    const handleViewDetail = (lead: PropertyLeadDto) => {
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
        setSelectedStatus(prev => prev === status ? null : status);
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
                        className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-text-muted border border-border-main">
                        <User className="h-5 w-5"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-text-main">{owner.firstName} {owner.lastName}</span>
                        <span className="text-xs text-text-muted">{owner.email}</span>
                    </div>
                </div>
            );
        }
        const {name, details} = parseUserInfo(userInfo);
        return (
            <div className="flex items-center gap-3">
                <div
                    className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-text-muted border border-border-main">
                    <User className="h-5 w-5"/>
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-text-main">{name}</span>
                    <span className="text-xs text-text-muted">{details}</span>
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
                            className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-text-muted border border-border-main">
                            <Building2 className="h-5 w-5"/>
                        </div>
                        <div className="flex flex-col">
                            <span
                                className="font-medium text-text-secondary line-clamp-1">{matchedProp.location.street}</span>
                            <div className="text-xs text-text-muted flex items-center gap-1">
                                <MapPin className="h-3 w-3"/>
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
                        <span className="font-medium text-text-secondary truncate">{obj.address}</span>
                        <span className="text-xs text-text-muted truncate">{obj.city}</span>
                    </div>
                );
            }
        } catch {
            // Silently ignore parsing errors
        }

        return (
            <div className="flex items-center gap-2">
                <span className="truncate max-w-[200px] text-text-secondary" title={propertyInfoStr}>
                    {propertyInfoStr}
                </span>
            </div>
        );
    };

    const filteredLeads = leads;

    const columns: Column[] = [
        {
            header: (
                <div className="flex items-center gap-1">
                    ID {sortConfig.key === 'id' &&
                    <ListFilter className="h-4 w-4"/>}
                </div>
            ),
            width: "5%",
            onClick: () => handleSort('id'),
        },
        {
            header: (
                <div className="flex items-center gap-1">
                    User Info {sortConfig.key === 'userInfo' &&
                    <ListFilter className="h-4 w-4"/>}
                </div>
            ),
            width: "25%",
            onClick: () => handleSort('userInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    Property address {sortConfig.key === 'propertyInfo' &&
                    <ListFilter className="h-4 w-4"/>}
                </div>
            ),
            width: "25%",
            onClick: () => handleSort('propertyInfo'),
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => handleSort('status')}
                            className="h-auto p-0 font-normal hover:bg-transparent hover:text-text-main text-xs uppercase tracking-wider text-text-secondary">
                        Status {sortConfig.key === 'status' &&
                        <ListFilter className="h-4 w-4"/>}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost"
                                    aria-label="Filter by status"
                                    className="h-6 w-6 p-0 hover:bg-muted rounded-full relative ml-1">
                                <ListFilter
                                    className={cn("h-4 w-4", selectedStatus ? "text-primary" : "text-text-muted")}/>
                                {selectedStatus && (
                                    <span
                                        className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border-2 border-surface-main"/>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start"
                                             className="bg-surface-main border-border-main text-text-main w-56">
                            <DropdownMenuLabel
                                className="text-xs font-normal text-text-muted uppercase tracking-wider px-2 py-1.5">
                                Filter by status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border-main/20"/>

                            <DropdownMenuItem
                                className="focus:bg-muted focus:text-text-main cursor-pointer py-2 px-2"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedStatus(null);
                                }}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Checkbox
                                        checked={selectedStatus === null}
                                        className="border-input-border data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                    />
                                    <span className="text-sm">All Statuses</span>
                                </div>
                            </DropdownMenuItem>

                            {Object.values(LEAD_STATUS_CONFIG).map((config) => (
                                <DropdownMenuItem
                                    key={config.value}
                                    className="focus:bg-muted focus:text-text-main cursor-pointer py-2 px-2"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        toggleStatus(config.value);
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <Checkbox
                                            checked={selectedStatus === config.value}
                                            className="border-input-border data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
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
            header: "",
            width: "5%",
            className: "text-right"
        }
    ];

    let content;
    if (isLeadsLoading) {
        content = [1, 2, 3, 4, 5].map((id) => (
            <TableRow key={`skeleton-${id}`} className="border-b border-border-main">
                <TableCell><Skeleton className="h-4 w-8 bg-muted"/></TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-muted"/>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24 bg-muted"/>
                            <Skeleton className="h-3 w-32 bg-muted"/>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg bg-muted"/>
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32 bg-muted"/>
                            <Skeleton className="h-3 w-20 bg-muted"/>
                        </div>
                    </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20 bg-muted"/></TableCell>

                <TableCell><Skeleton className="h-8 w-8 bg-muted ml-auto"/></TableCell>
            </TableRow>
        ));
    } else if (isLeadsError) {
        content = (
            <TableRow className="border-slate-700/50 hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center text-red-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Info className="h-8 w-8 opacity-50"/>
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
                          className="border-b border-border-main hover:bg-muted transition-colors group">
                    <TableCell className="font-medium text-text-muted">#{lead.id}</TableCell>
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

                    <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-text-secondary hover:text-text-main hover:bg-muted"
                            onClick={() => handleViewDetail(lead)}
                        >
                            <Eye className="h-5 w-5"/>
                        </Button>
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