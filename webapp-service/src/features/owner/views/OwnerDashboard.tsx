import React, { useMemo, useState } from 'react';
import OwnerLayout from '../layouts/OwnerLayout';
import { Eye, FileText, MapPin, Plus, Shield } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { fetchOwnerProperties } from '../services/ownerService';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OwnerLeadForm } from '../components/OwnerLeadForm';
import { PropertyLeadDto } from '@/features/admin/services/leadService';
import { LeadQuotesList } from '@/features/owner/components/LeadQuotesList';
import { LEAD_STATUS_CONFIG } from '@/features/admin/utils/statusMapping';
import apiClient from '@/services/apiClient';
import { fetchPropertyById } from '@/features/admin/services/propertyService';
import { LeadDetailDialog } from '@/features/admin/components/LeadDetailDialog';
import { ResearchButton } from '@/features/research/views/ResearchButton';

const fetchOwnerLeads = async (userId: string) => {
    const response = await apiClient.get<PropertyLeadDto[]>(`/picma/leads/user/${userId}`);
    return response.data;
};

const LeadCard: React.FC<{ lead: PropertyLeadDto }> = ({ lead }) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: property, isLoading } = useQuery({
        queryKey: ['property-details', lead.propertyInfo],
        queryFn: () => fetchPropertyById(lead.propertyInfo),
        staleTime: 1000 * 60 * 5,
    });

    const showStatus = lead.status === 'ACCEPTED' || lead.status === 'REJECTED' || lead.status === 'EXPIRED';
    const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.ACTIVE;

    const handleViewDetails = () => {
        setIsDetailOpen(true);
    };

    const leadForDialog = {
        ...lead,
        createDate: lead.createDate || new Date().toISOString(),
    };

    return (
        <>
            <Card
                className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-[#141124]">
                <div className="h-48 bg-slate-800 relative overflow-hidden group">
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                        <MapPin className="h-12 w-12 opacity-50" />
                    </div>

                    {showStatus && (
                        <div className="absolute top-3 right-3">
                            <Badge variant="outline"
                                className={cn("border-0 font-medium backdrop-blur-sm shadow-sm", statusConfig.className)}>
                                {statusConfig.label}
                            </Badge>
                        </div>
                    )}

                    <div
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
                            onClick={handleViewDetails}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                    </div>
                </div>
                <CardContent className="p-5">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4 bg-slate-800" />
                            <Skeleton className="h-4 w-1/2 bg-slate-800" />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-white line-clamp-1 flex-1 mr-2"
                                    title={property?.location?.street}>
                                    {property?.location?.street || `Property #${lead.propertyInfo}`}
                                </h3>
                                <ResearchButton lead={lead} propertyId={lead.propertyInfo} />
                            </div>
                            <div className="flex items-center text-slate-400 text-sm mb-4">
                                <MapPin className="h-3 w-3 mr-1" />
                                {property?.location?.city || 'Unknown City'}, {property?.location?.zipCode || ''}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-slate-400 text-xs">Type</p>
                                    <p className="font-medium text-slate-300">
                                        {property?.attributes?.constructionType
                                            ? property.attributes.constructionType.replace('_', ' ')
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Lead ID</p>
                                    <p className="font-medium text-slate-300">#{lead.id}</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="p-0 flex flex-col">
                    <LeadQuotesList leadId={lead.id} leadStatus={lead.status} />
                </CardFooter>
            </Card>

            <LeadDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                lead={leadForDialog}
                hideUserInfo={true}
            />
        </>
    );
};

const OwnerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'leads'>('leads');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const ownerId = user?.id || '';

    const { data: properties, isLoading: isPropsLoading } = useQuery({
        queryKey: ['owner-properties', ownerId],
        queryFn: () => fetchOwnerProperties(ownerId),
        enabled: !!ownerId
    });

    const { data: leads, isLoading: isLeadsLoading } = useQuery({
        queryKey: ['owner-leads', ownerId],
        queryFn: () => fetchOwnerLeads(ownerId),
        enabled: !!ownerId
    });

    const totalAssetValue = useMemo(() => {
        // @ts-ignore
        return properties?.reduce((acc, p) => acc + (p.valuation?.estimatedConstructionCost || 0), 0) || 0;
    }, [properties]);

    const activePoliciesCount = useMemo(() => {
        return leads?.filter(l => l.status === 'ACCEPTED').length || 0;
    }, [leads]);

    const pendingQuotesCount = useMemo(() => {
        return leads?.filter(l => l.status === 'IN_REVIEWING').length || 0;
    }, [leads]);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
    };

    return (
        <OwnerLayout>
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Total Asset Value</h3>
                            <Shield className="h-6 w-6 opacity-80" />
                        </div>
                        <p className="text-3xl font-bold">
                            {isPropsLoading ?
                                <Skeleton className="h-8 w-32 bg-white/20" /> : formatCurrency(totalAssetValue)}
                        </p>
                        <p className="text-sm opacity-80 mt-1">Based on property construction cost</p>
                    </div>
                    <div className="bg-[#141124] rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">My Active Policies</h3>
                            <FileText className="h-6 w-6 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {isLeadsLoading ? <Skeleton className="h-8 w-12 bg-slate-800" /> : activePoliciesCount}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Accepted Quotes
                        </p>
                    </div>
                    <div className="bg-[#141124] rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">Pending Quotes</h3>
                            <FileText className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {isLeadsLoading ? <Skeleton className="h-8 w-12 bg-slate-800" /> : pendingQuotesCount}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">Review required</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-6 border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'leads' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                My leads
                                {activeTab === 'leads' && <div
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
                            </button>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-lg text-white">
                                    <Plus className="h-4 w-4" />
                                    Create Property Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="bg-[#141124] border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Property Lead</DialogTitle>
                                </DialogHeader>
                                <OwnerLeadForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLeadsLoading ? (
                            [1, 2, 3].map((id) => (
                                <Skeleton key={`skeleton-${id}`} className="h-64 w-full rounded-xl bg-slate-800" />
                            ))
                        ) : (
                            <>
                                {leads?.length === 0 ? (
                                    <div
                                        className="col-span-full py-12 text-center text-slate-500 bg-[#141124] rounded-xl border border-dashed border-slate-800">
                                        <p>No leads found. Create one to get started!</p>
                                    </div>
                                ) : (
                                    leads?.map((lead) => (
                                        <LeadCard key={lead.id} lead={lead} />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
};

export default OwnerDashboard;