import React from 'react';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {DialogFooter} from '@/components/ui/dialog';
import {SearchableSelect} from '@/components/ui/searchable-select';
import {fetchAllLeads} from '../services/leadService';
import {fetchUsers} from '../services/userService';
import {fetchPropertyById} from '../services/propertyService';
import {PropertyQuoteDto} from '../services/quoteService';
import {Skeleton} from '@/components/ui/skeleton';
import {CalendarClock, Home, User, Wallet} from 'lucide-react';

const quoteSchema = z.object({
    leadId: z.coerce.number().min(1, 'Lead is required'),
    agentId: z.string().min(1, 'Agent is required'),
    plan: z.enum(['BRONZE', 'SILVER', 'GOLD']),
    sumInsured: z.coerce.number().positive('Sum Insured must be positive'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
    initialData?: PropertyQuoteDto | null;
    onSubmit: (data: QuoteFormData & { premium: { net: number; tax: number; total: number } }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({initialData, onSubmit, onCancel, isLoading}) => {
    const {
        control,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema) as any,
        defaultValues: {
            leadId: initialData?.leadId || 0,
            agentId: initialData?.agentId || '',
            plan: (initialData?.plan as any) || 'BRONZE',
            sumInsured: initialData?.sumInsured || 0,
            startDate: initialData?.startDate || '',
            endDate: initialData?.endDate || '',
        },
    });

    const {data: leads} = useQuery({
        queryKey: ['all-leads-for-select'],
        queryFn: () => fetchAllLeads(),
    });

    const {data: agents} = useQuery({
        queryKey: ['all-agents-for-select'],
        queryFn: () => fetchUsers('agent'),
    });

    const selectedLeadId = useWatch({control, name: 'leadId'});
    const selectedPlan = useWatch({control, name: 'plan'});
    const sumInsured = useWatch({control, name: 'sumInsured'});

    const selectedLead = leads?.find(l => l.id === selectedLeadId);

    const {data: selectedProperty, isLoading: isPropertyLoading} = useQuery({
        queryKey: ['property', selectedLead?.propertyInfo],
        queryFn: () => fetchPropertyById(selectedLead!.propertyInfo),
        enabled: !!selectedLead?.propertyInfo,
    });

    const calculatePremium = (plan: string, sum: number) => {
        let rate = 0.001;
        if (plan === 'SILVER') rate = 0.0012;
        if (plan === 'GOLD') rate = 0.0015;

        const net = Math.round(sum * rate);
        const tax = Math.round(net * 0.1);
        const total = net + tax;

        return {net, tax, total};
    };

    const calculatedPremium = calculatePremium(selectedPlan, sumInsured);

    const handleUseValuation = () => {
        if (selectedProperty?.valuation?.estimatedConstructionCost) {
            setValue('sumInsured', selectedProperty.valuation.estimatedConstructionCost);
        } else if (selectedLead?.valuation) {
            setValue('sumInsured', selectedLead.valuation);
        }
    };

    const handleFormSubmit = (data: QuoteFormData) => {
        onSubmit({
            ...data,
            premium: calculatedPremium
        });
    };

    const leadOptions = leads?.map(l => ({
        value: l.id,
        label: `${l.userInfo} (Lead #${l.id})`,
        subLabel: `Status: ${l.status}`
    })) || [];

    const agentOptions = agents?.map(a => ({
        value: a.id,
        label: `${a.firstName} ${a.lastName} (${a.username})`,
        subLabel: `Zip: ${a.zipCode || 'N/A'}`
    })) || [];

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Select Lead</Label>
                    <Controller
                        name="leadId"
                        control={control}
                        render={({field}) => (
                            <SearchableSelect
                                options={leadOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Search client name..."
                                isLoading={!leads}
                            />
                        )}
                    />
                    {errors.leadId && <p className="text-red-500 text-sm">{errors.leadId.message}</p>}

                    {selectedLead && (
                        <div
                            className="mt-2 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-medium">
                                <User size={14}/> Client Info
                            </div>
                            <p className="text-slate-300"><span
                                className="text-slate-500">Name:</span> {selectedLead.userInfo}</p>
                            {isPropertyLoading ? <Skeleton className="h-4 w-full mt-1"/> : selectedProperty && (
                                <>
                                    <p className="text-slate-300 truncate"><span
                                        className="text-slate-500">Address:</span> {selectedProperty.location.street}
                                    </p>
                                    <p className="text-slate-300"><span
                                        className="text-slate-500">Valuation:</span> {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(selectedProperty.valuation.estimatedConstructionCost)}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Select Agent</Label>
                    <Controller
                        name="agentId"
                        control={control}
                        render={({field}) => (
                            <SearchableSelect
                                options={agentOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Search agent..."
                                isLoading={!agents}
                            />
                        )}
                    />
                    {errors.agentId && <p className="text-red-500 text-sm">{errors.agentId.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="plan">Insurance Plan</Label>
                    <Controller
                        name="plan"
                        control={control}
                        render={({field}) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="bg-slate-900 border-slate-700">
                                    <SelectValue placeholder="Select plan"/>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="BRONZE">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-amber-700"/>
                                            Bronze
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="SILVER">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-slate-400"/>
                                            Silver
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="GOLD">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500"/>
                                            Gold
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.plan && <p className="text-red-500 text-sm">{errors.plan.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sumInsured">Sum Insured</Label>
                        {selectedProperty && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-indigo-400 hover:text-indigo-300"
                                onClick={handleUseValuation}
                            >
                                <Home className="h-3 w-3 mr-1"/> Use Property Value
                            </Button>
                        )}
                    </div>
                    <Controller
                        name="sumInsured"
                        control={control}
                        render={({field}) => (
                            <Input
                                id="sumInsured"
                                {...field}
                                type="number"
                                className="bg-slate-900 border-slate-700"
                            />
                        )}
                    />
                    {errors.sumInsured && <p className="text-red-500 text-sm">{errors.sumInsured.message}</p>}
                </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <CalendarClock size={16} className="text-indigo-400"/> Validity Period
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({field}) => (
                                <Input
                                    id="startDate"
                                    {...field}
                                    type="date"
                                    className="bg-slate-900 border-slate-700"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({field}) => (
                                <Input
                                    id="endDate"
                                    {...field}
                                    type="date"
                                    className="bg-slate-900 border-slate-700"
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 mt-4">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-3">
                    <Wallet size={18}/> Estimated Premium
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs uppercase">Net Premium</p>
                        <p className="text-slate-300 font-medium">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(calculatedPremium.net)}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase">VAT (10%)</p>
                        <p className="text-slate-300 font-medium">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(calculatedPremium.tax)}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs uppercase">Total Pay</p>
                        <p className="text-emerald-400 font-bold text-lg">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(calculatedPremium.total)}
                        </p>
                    </div>
                </div>
            </div>

            <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {initialData ? 'Save Changes' : 'Create Quote'}
                </Button>
            </DialogFooter>
        </form>
    );
};