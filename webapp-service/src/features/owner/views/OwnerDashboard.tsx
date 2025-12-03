import React, {useState} from 'react';
import OwnerLayout from '../layouts/OwnerLayout';
import {CheckCircle, FileText, MapPin, MoreHorizontal, Phone, Plus, Search, Shield} from 'lucide-react';
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {useQuery} from '@tanstack/react-query';
import {fetchAgentsForDirectory, fetchOwnerProperties} from '../services/ownerService';
import {Skeleton} from '@/components/ui/skeleton';

const OwnerDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'properties' | 'agents'>('properties');
    const [ownerId] = useState('owner123');

    const {data: properties, isLoading: isPropsLoading} = useQuery({
        queryKey: ['owner-properties', ownerId],
        queryFn: () => fetchOwnerProperties(ownerId)
    });

    const {data: agents, isLoading: isAgentsLoading} = useQuery({
        queryKey: ['owner-agents', searchTerm],
        queryFn: () => fetchAgentsForDirectory(searchTerm || '90210'),
        enabled: activeTab === 'agents'
    });

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
                        <p className="text-3xl font-bold">$1,250,000</p>
                        <p className="text-sm opacity-80 mt-1">+5.2% from last year</p>
                    </div>
                    <div className="bg-[#141124] rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">Active Policies</h3>
                            <FileText className="h-6 w-6 text-emerald-500"/>
                        </div>
                        <p className="text-3xl font-bold text-white">1</p>
                        <p className="text-sm text-slate-400 mt-1">1 property uninsured</p>
                    </div>
                    <div className="bg-[#141124] rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">Pending Quotes</h3>
                            <FileText className="h-6 w-6 text-blue-500"/>
                        </div>
                        <p className="text-3xl font-bold text-white">2</p>
                        <p className="text-sm text-slate-400 mt-1">Review required</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-6 border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab('properties')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'properties' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                My Properties
                                {activeTab === 'properties' && <div
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"/>}
                            </button>
                            <button
                                onClick={() => setActiveTab('agents')}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors relative",
                                    activeTab === 'agents' ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Find Agents
                                {activeTab === 'agents' && <div
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"/>}
                            </button>
                        </div>

                        {activeTab === 'properties' && (
                            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-lg text-white">
                                <Plus className="h-4 w-4"/>
                                Add Property
                            </Button>
                        )}
                    </div>

                    {activeTab === 'properties' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isPropsLoading ? (
                                Array.from({length: 3}).map((_, i) => (
                                    <Skeleton key={i} className="h-64 w-full rounded-xl bg-slate-800"/>
                                ))
                            ) : properties?.map((property) => (
                                <Card key={property.id}
                                      className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-[#141124]">
                                    <div className="h-48 bg-slate-800 relative overflow-hidden">
                                        <img
                                            src={property.imageUrl}
                                            alt={property.address}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3">
                                            {property.isInsured ? (
                                                <Badge
                                                    className="bg-emerald-500/90 hover:bg-emerald-600 text-white border-none backdrop-blur-sm">
                                                    Insured
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive"
                                                       className="bg-red-500/90 hover:bg-red-600 text-white border-none backdrop-blur-sm">
                                                    Uninsured
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <h3 className="font-bold text-lg text-white line-clamp-1">{property.address}</h3>
                                        <div className="flex items-center text-slate-400 text-sm mt-1 mb-4">
                                            <MapPin className="h-3 w-3 mr-1"/>
                                            {property.city}, {property.zipCode}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-400 text-xs">Type</p>
                                                <p className="font-medium text-slate-300">{property.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs">Last Assessment</p>
                                                <p className="font-medium text-slate-300">{property.lastAssessmentDate}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-5 pt-0 flex gap-2">
                                        <Button
                                            className="flex-1 bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50 border-slate-700 shadow-none">
                                            View Quotes
                                        </Button>
                                        <Button variant="outline" size="icon"
                                                className="border-slate-700 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800">
                                            <MoreHorizontal className="h-4 w-4"/>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex gap-4 max-w-lg">
                                <div className="relative flex-1">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"/>
                                    <Input
                                        placeholder="Search by Zip Code..."
                                        className="pl-9 bg-[#0b0c15] border-slate-700 text-white placeholder:text-slate-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline"
                                        className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 bg-[#0b0c15]">Filters</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isAgentsLoading ? (
                                    Array.from({length: 3}).map((_, i) => (
                                        <Skeleton key={i} className="h-48 w-full rounded-xl bg-slate-800"/>
                                    ))
                                ) : agents?.map((agent) => (
                                    <Card key={agent.id}
                                          className="border-none shadow-sm bg-[#141124] hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex gap-3">
                                                    <div
                                                        className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white">
                                                        {agent.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white">{agent.name}</h3>
                                                        <p className="text-sm text-slate-400">{agent.firm}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary"
                                                       className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/50">
                                                    ★ {agent.rating}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 text-sm text-slate-400 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-slate-500"/>
                                                    Serves {agent.zipCode}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-emerald-500"/>
                                                    Licensed & Verified
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                                <Phone className="h-4 w-4"/>
                                                Contact Agent
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
};

export default OwnerDashboard;