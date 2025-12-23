import React, {useMemo, useState} from 'react';
import OwnerLayout from '../layouts/OwnerLayout';
import {Eye, FileText, MapPin, Plus, Shield} from 'lucide-react';
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {cn, formatCurrency} from "@/lib/utils";
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchOwnerProperties} from '../services/ownerService';
import {Skeleton} from '@/components/ui/skeleton';
import {useAuth} from '@/context/AuthContext';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {OwnerLeadForm} from '../components/OwnerLeadForm';
import {deleteLead, PropertyLeadDto} from '@/features/admin/services/leadService';
import {LeadQuotesList} from '@/features/owner/components/LeadQuotesList';
import {LEAD_STATUS_CONFIG} from '@/features/admin/utils/statusMapping';
import apiClient from '@/services/apiClient';
import {deleteProperty, fetchPropertyById} from '@/features/admin/services/propertyService';
import {toast} from 'sonner';

import {ResearchButton} from '@/features/research/views/ResearchButton';

const fetchOwnerLeads = async (userId: string) => {
    const response = await apiClient.get<PropertyLeadDto[]>(`/picma/leads/user/${userId}`);
    return response.data;
};

const LeadCard: React.FC<{ lead: PropertyLeadDto }> = ({lead}) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {

            await deleteLead(lead.id);
            if (lead.propertyInfo) {
                await deleteProperty(lead.propertyInfo);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["owner-leads"]});
            queryClient.invalidateQueries({queryKey: ["owner-properties"]});
            toast.success("Lead and property deleted successfully");
            setIsDeleteOpen(false);
        },
        onError: (error) => {
            console.error("Failed to delete", error);
            toast.error("Failed to delete lead");
        }
    });

    const {data: property, isLoading} = useQuery({
        queryKey: ['property-details', lead.propertyInfo],
        queryFn: () => fetchPropertyById(lead.propertyInfo),
        staleTime: 1000 * 60 * 5,
    });

    const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.NEW;

    const handleEdit = () => {
        setIsEditOpen(true);
    };

    return (
        <>
            <Card
                className="border border-border-main shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-surface-main group hover:border-primary/30">
                <div className="h-48 bg-muted/50 relative overflow-hidden group border-b border-border-main">
                    <div className="w-full h-full flex items-center justify-center bg-muted/50 text-text-muted">
                        <MapPin className="h-12 w-12 opacity-30"/>
                    </div>

                    <div className="absolute top-3 right-3">
                        <Badge variant="outline"
                               className={cn("font-medium backdrop-blur-sm shadow-sm border", statusConfig.className)}>
                            {statusConfig.label}
                        </Badge>
                    </div>

                    <div
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 backdrop-blur-md transition-colors"
                            onClick={handleEdit}
                        >
                            <Eye className="mr-2 h-4 w-4"/>
                            View
                        </Button>
                    </div>
                </div>
                <CardContent className="p-5">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4 bg-muted"/>
                            <Skeleton className="h-4 w-1/2 bg-muted"/>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-text-main line-clamp-1 flex-1 mr-2"
                                    title={property?.location?.street}>
                                    {property?.location?.street || `Property #${lead.propertyInfo}`}
                                </h3>
                                <ResearchButton lead={lead} propertyId={lead.propertyInfo}/>
                            </div>
                            <div className="flex items-center text-text-muted text-sm mb-4">
                                <MapPin className="h-3 w-3 mr-1"/>
                                <div className="flex gap-2">
                                    <span>{property?.location?.city || 'Unknown City'}, {lead.zipCode || ''}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-text-muted text-xs">Type</p>
                                    <p className="font-medium text-text-secondary">
                                        {property?.attributes?.constructionType
                                            ? property.attributes.constructionType.replace('_', ' ')
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-text-muted text-xs">Lead ID</p>
                                    <p className="font-medium text-text-secondary">#{lead.id}</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="p-0 flex flex-col">
                    <LeadQuotesList leadId={lead.id} leadStatus={lead.status}/>
                </CardFooter>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent
                    className="bg-surface-main border-border-main text-text-main max-w-2xl max-h-[90vh] overflow-y-auto">

                    {property && (
                        <OwnerLeadForm
                            initialLead={lead}
                            initialProperty={property}
                            onSuccess={() => setIsEditOpen(false)}
                            onCancel={() => setIsEditOpen(false)}
                            onDelete={() => setIsDeleteOpen(true)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-surface-main border-border-main text-text-main max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Lead & Property</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-text-muted">
                            Are you sure you want to delete this lead? <br/>
                            <span className="text-red-400 font-medium">This will also delete the associated property data permanently.</span>
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const OwnerDashboard: React.FC = () => {
    const {user} = useAuth();
    const [activeTab, setActiveTab] = useState<'leads'>('leads');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const ownerId = user?.id || '';

    const {data: properties, isLoading: isPropsLoading} = useQuery({
        queryKey: ['owner-properties', ownerId],
        queryFn: () => fetchOwnerProperties(ownerId),
        enabled: !!ownerId
    });

    const {data: leads, isLoading: isLeadsLoading} = useQuery({
        queryKey: ['owner-leads', ownerId],
        queryFn: () => fetchOwnerLeads(ownerId),
        enabled: !!ownerId
    });

    const totalAssetValue = useMemo(() => {
        return properties?.reduce((acc, p) => acc + (p.valuation?.estimatedConstructionCost || 0), 0) || 0;
    }, [properties]);

    const newLeadsCount = useMemo(() => {
        return leads?.filter(l => l.status === 'NEW').length || 0;
    }, [leads]);

    const inReviewLeadsCount = useMemo(() => {
        return leads?.filter(l => l.status === 'IN_REVIEW').length || 0;
    }, [leads]);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
    };

    return (
        <OwnerLayout>
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-text-main">Total Asset Value</h3>
                            <Shield className="h-6 w-6 text-primary"/>
                        </div>
                        <p className="text-3xl font-bold text-text-main">
                            {isPropsLoading ?
                                <Skeleton className="h-8 w-32 bg-muted/20"/> : formatCurrency(totalAssetValue)}
                        </p>
                        <p className="text-sm text-text-muted mt-1">Based on property construction cost</p>
                    </div>
                    <div
                        className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm hover:border-emerald-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-text-main">New Leads</h3>
                            <FileText className="h-6 w-6 text-emerald-500"/>
                        </div>
                        <p className="text-3xl font-bold text-text-main">
                            {isLeadsLoading ? <Skeleton className="h-8 w-12 bg-muted"/> : newLeadsCount}
                        </p>
                        <p className="text-sm text-text-muted mt-1">
                            Recently created
                        </p>
                    </div>
                    <div
                        className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm hover:border-amber-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-text-main">In Review</h3>
                            <FileText className="h-6 w-6 text-amber-500"/>
                        </div>
                        <p className="text-3xl font-bold text-text-main">
                            {isLeadsLoading ? <Skeleton className="h-8 w-12 bg-muted"/> : inReviewLeadsCount}
                        </p>
                        <p className="text-sm text-text-muted mt-1">Under agent review</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-6 border-b border-border-main">
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'leads' ? "text-primary border-b-2 border-primary" : "text-text-muted hover:text-text-secondary hover:bg-muted/50 rounded-md px-2"
                                )}
                            >
                                My leads
                            </button>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-primary hover:bg-primary-hover gap-2 rounded-lg text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all">
                                    <Plus className="h-4 w-4"/>
                                    Create Property Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="bg-surface-main border-border-main text-text-main max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Property Lead</DialogTitle>
                                </DialogHeader>
                                <OwnerLeadForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)}/>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLeadsLoading ? (
                            [1, 2, 3].map((id) => (
                                <Skeleton key={`skeleton-${id}`} className="h-64 w-full rounded-xl bg-muted"/>
                            ))
                        ) : (
                            <>
                                {leads?.length === 0 ? (
                                    <div
                                        className="col-span-full py-12 text-center text-text-muted bg-surface-main rounded-xl border border-dashed border-border-main">
                                        <p>No leads found. Create one to get started!</p>
                                    </div>
                                ) : (
                                    leads?.map((lead) => (
                                        <LeadCard key={lead.id} lead={lead}/>
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