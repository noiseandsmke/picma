import React, {useMemo, useState} from 'react';
import OwnerLayout from '../layouts/OwnerLayout';
import {FileText, MapPin, Plus, Shield} from 'lucide-react';
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {cn, formatCurrency} from "@/lib/utils";
import {useQuery} from '@tanstack/react-query';
import {fetchOwnerProperties} from '../services/ownerService';
import {Skeleton} from '@/components/ui/skeleton';
import {useAuth} from '@/context/AuthContext';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {OwnerLeadForm} from '../components/OwnerLeadForm';
import {PropertyLeadDto} from '@/features/admin/services/leadService';
import {LeadQuotesList} from '@/features/owner/components/LeadQuotesList';
import {LEAD_STATUS_CONFIG} from '@/features/admin/utils/statusMapping';
import apiClient from '@/services/apiClient';

const fetchOwnerLeads = async (userId: string) => {
    const response = await apiClient.get<PropertyLeadDto[]>(`/picma/leads/user/${userId}`);
    return response.data;
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
        return properties?.reduce((acc, p) => acc + (p.valuation?.marketValue || 0), 0) || 0;
    }, [properties]);

    const activePoliciesCount = useMemo(() => {
        return properties?.filter(p => p.isInsured).length || 0;
    }, [properties]);

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
                            <Shield className="h-6 w-6 opacity-80"/>
                        </div>
                        <p className="text-3xl font-bold">
                            {isPropsLoading ?
                                <Skeleton className="h-8 w-32 bg-white/20"/> : formatCurrency(totalAssetValue)}
                        </p>
                        <p className="text-sm opacity-80 mt-1">Based on property valuation</p>
                    </div>
                    <div className="bg-[#141124] rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">My Insurance Quotes</h3>
                            <FileText className="h-6 w-6 text-emerald-500"/>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {isPropsLoading ? <Skeleton className="h-8 w-12 bg-slate-800"/> : activePoliciesCount}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Active policies
                        </p>
                    </div>
                    <div className="bg-[#141124] rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">Pending Quotes</h3>
                            <FileText className="h-6 w-6 text-blue-500"/>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {pendingQuotesCount}
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
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"/>}
                            </button>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-lg text-white">
                                    <Plus className="h-4 w-4"/>
                                    Create Property Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="bg-[#141124] border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Property Lead</DialogTitle>
                                </DialogHeader>
                                <OwnerLeadForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)}/>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLeadsLoading ? (
                            Array.from({length: 3}).map((_, i) => (
                                <Skeleton key={i} className="h-64 w-full rounded-xl bg-slate-800"/>
                            ))
                        ) : leads?.map((lead) => {
                            const property = properties?.find(p => String(p.id) === lead.propertyInfo);
                            const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.ACTIVE;

                            return (
                                <Card key={lead.id}
                                      className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-[#141124]">
                                    <div className="h-48 bg-slate-800 relative overflow-hidden">
                                        {property?.imageUrl ? (
                                            <img
                                                src={property.imageUrl}
                                                alt={property.address}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                                <MapPin className="h-12 w-12 opacity-50"/>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge variant="outline"
                                                   className={cn("border-0 font-medium backdrop-blur-sm shadow-sm", statusConfig.className)}>
                                                {statusConfig.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <h3 className="font-bold text-lg text-white line-clamp-1">
                                            {property?.address || `Property #${lead.propertyInfo}`}
                                        </h3>
                                        <div className="flex items-center text-slate-400 text-sm mt-1 mb-4">
                                            <MapPin className="h-3 w-3 mr-1"/>
                                            {property?.city || 'Unknown City'}, {property?.zipCode || ''}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                            <div>
                                                <p className="text-slate-400 text-xs">Type</p>
                                                <p className="font-medium text-slate-300">{property?.type || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs">Lead ID</p>
                                                <p className="font-medium text-slate-300">#{lead.id}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-0 flex flex-col">
                                        <LeadQuotesList leadId={lead.id} leadStatus={lead.status}/>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
};

export default OwnerDashboard;