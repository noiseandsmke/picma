import React, {useMemo, useState} from 'react';
import OwnerLayout from '../layouts/OwnerLayout';
import {FileText, MapPin, MoreHorizontal, Plus, Shield} from 'lucide-react';
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {cn, formatCurrency} from "@/lib/utils";
import {useQuery} from '@tanstack/react-query';
import {fetchOwnerProperties} from '../services/ownerService';
import {Skeleton} from '@/components/ui/skeleton';
import {useAuth} from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {VN_LOCATIONS} from "@/lib/vn-locations";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";

interface OwnerLead {
    id: number;
    status: string;
}

const fetchOwnerLeads = async (userId: string) => {
    const response = await apiClient.get<OwnerLead[]>(`/picma/leads/user/${userId}`);
    return response.data;
};

const createLeadSchema = z.object({
    propertyName: z.string().min(1, "Property Name is required"),
    city: z.string().min(1, "City is required"),
    ward: z.string().min(1, "Ward is required"),
});

type CreateLeadFormValues = z.infer<typeof createLeadSchema>;

const OwnerDashboard: React.FC = () => {
    const {user} = useAuth();
    const [activeTab, setActiveTab] = useState<'properties'>('properties');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const ownerId = user?.id || '';

    const cities = VN_LOCATIONS;
    const [selectedCityName, setSelectedCityName] = useState<string>("");

    const {data: properties, isLoading: isPropsLoading} = useQuery({
        queryKey: ['owner-properties', ownerId],
        queryFn: () => fetchOwnerProperties(ownerId),
        enabled: !!ownerId
    });

    const {data: leads} = useQuery({
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

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<CreateLeadFormValues>({
        resolver: zodResolver(createLeadSchema),
        defaultValues: {
            propertyName: "",
            city: "",
            ward: "",
        },
    });

    const selectedCity = cities.find(c => c.name === selectedCityName);
    const wards = selectedCity ? selectedCity.wards : [];

    const handleCreateLead = async (data: CreateLeadFormValues) => {
        try {
            let zipcode = "";
            if (data.ward) {
                const foundWard = wards.find(w => w.name === data.ward);
                if (foundWard) {
                    zipcode = foundWard.zipCode;
                }
            }

            await apiClient.post('/picma/leads', {
                propertyInfo: data.propertyName,
                userInfo: ownerId,
                status: 'NEW',
                propertyAddress: `${data.ward}, ${data.city}`,
                zipCode: zipcode
            });

            toast.success("Property Lead Created Successfully");
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create lead");
        }
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
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-lg text-white">
                                    <Plus className="h-4 w-4"/>
                                    Create Property Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#141124] border-slate-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Create New Property Lead</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit(handleCreateLead)} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Property Name / Address</Label>
                                        <Controller
                                            control={control}
                                            name="propertyName"
                                            render={({field}) => (
                                                <Input {...field} className="bg-slate-900 border-slate-700 text-white"/>
                                            )}
                                        />
                                        {errors.propertyName &&
                                            <p className="text-red-500 text-xs">{errors.propertyName.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Controller
                                                control={control}
                                                name="city"
                                                render={({field}) => (
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            setSelectedCityName(val);
                                                            setValue("ward", "");
                                                        }}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger
                                                            className="bg-slate-900 border-slate-700 text-white">
                                                            <SelectValue placeholder="Select City"/>
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            className="bg-[#0b0c15] border-slate-800 text-white">
                                                            {cities.map((city) => (
                                                                <SelectItem key={city.name} value={city.name}>
                                                                    {city.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.city &&
                                                <p className="text-red-500 text-xs">{errors.city.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ward</Label>
                                            <Controller
                                                control={control}
                                                name="ward"
                                                render={({field}) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={!selectedCityName}
                                                    >
                                                        <SelectTrigger
                                                            className="bg-slate-900 border-slate-700 text-white">
                                                            <SelectValue placeholder="Select Ward"/>
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            className="bg-[#0b0c15] border-slate-800 text-white h-60">
                                                            {wards.map((ward) => (
                                                                <SelectItem key={ward.name} value={ward.name}>
                                                                    {ward.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.ward &&
                                                <p className="text-red-500 text-xs">{errors.ward.message}</p>}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700"
                                            disabled={isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Create Lead"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

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
                </div>
            </div>
        </OwnerLayout>
    );
};

export default OwnerDashboard;