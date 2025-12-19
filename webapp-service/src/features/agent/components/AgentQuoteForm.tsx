import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
    Loader2, MapPin, Home, Building2, Hammer, Calendar, Layers, Ruler, Wallet, FileText 
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { CoverageSelection, CoverageSelector } from '@/components/ui/coverage-selector';
import { CoverageCode } from '@/types/enums';
import { CreateQuoteDto, PropertyQuoteDto } from '@/features/admin/services/quoteService';
import { AgentLeadDto } from '@/features/agent/services/agentService';
import { fetchPropertyById } from '@/features/admin/services/propertyService';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const agentQuoteSchema = z.object({
    leadId: z.number(),
    agentId: z.string(),

    coverages: z.array(
        z.object({
            code: z.nativeEnum(CoverageCode),
            limit: z.number().positive("Limit must be positive"),
            deductible: z.number().min(0).max(1, "Deductible must be between 0 and 1")
        })
    )
        .refine((arr) => arr.some(c => c.code === CoverageCode.FIRE), {
            message: "FIRE coverage is mandatory"
        })
});

type AgentQuoteFormValues = z.infer<typeof agentQuoteSchema>;

interface AgentQuoteFormProps {
    lead: AgentLeadDto | null;
    quote?: PropertyQuoteDto | null;
    agentId: string;
    onSubmit: (data: CreateQuoteDto) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

const RATES: Record<CoverageCode, number> = {
    [CoverageCode.FIRE]: 0.02,
    [CoverageCode.THEFT]: 0.015,
    [CoverageCode.NATURAL_DISASTER]: 0.025
};

const calculateDiscount = (deductible: number) => {
    if (deductible === 0) return 1.0;
    return Math.max(0.6, Math.exp(-5.0 * deductible));
};

export const AgentQuoteForm: React.FC<AgentQuoteFormProps> = ({
    lead,
    quote,
    agentId,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const { data: property, isLoading: isPropertyLoading } = useQuery({
        queryKey: ['property-details-quote', lead?.propertyInfo],
        queryFn: () => {
            if (!lead) return null;
            if (lead.propertyInfo.startsWith('{')) {
                try {
                    return Promise.resolve(JSON.parse(lead.propertyInfo));
                } catch {
                    return Promise.resolve(null);
                }
            }
            return fetchPropertyById(lead.propertyInfo);
        },
        enabled: !!lead
    });



    const defaultValues: AgentQuoteFormValues = {
        leadId: lead?.id || 0,
        agentId: agentId,

        coverages: quote ? quote.coverages.map(c => ({
            code: c.code as CoverageCode,
            limit: c.limit,
            deductible: c.deductible
        })) : [
            { code: CoverageCode.FIRE, limit: 0, deductible: 0 }
        ]
    };

    const form = useForm<AgentQuoteFormValues>({
        resolver: zodResolver(agentQuoteSchema),
        defaultValues,
        values: { ...defaultValues }
    });

    const watchedCoverages = form.watch('coverages');
    const estimatedPremium = useMemo(() => {
        if (!watchedCoverages) return { net: 0, tax: 0, total: 0 };
        let net = 0;
        watchedCoverages.forEach(c => {
            const rate = RATES[c.code] || 0;
            const basePremium = c.limit * rate;
            const discount = calculateDiscount(c.deductible);
            net += (basePremium * discount);
        });
        const tax = net * 0.1;
        return { net, tax, total: net + tax };
    }, [watchedCoverages]);

    const handleSubmit = (data: AgentQuoteFormValues) => {
        const payload: CreateQuoteDto = {
            ...data,
            coverages: data.coverages
        };
        onSubmit(payload);
    };

    if (isPropertyLoading) {
        return (
            <div className="space-y-6 pt-4">
                <div className="space-y-4">
                     <Skeleton className="h-8 w-1/3 bg-slate-800" />
                     <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full bg-slate-900" />
                        <Skeleton className="h-10 w-full bg-slate-900" />
                     </div>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
                

                <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-medium uppercase tracking-wider text-slate-300">Property Location</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <FormLabel className="text-slate-400">Ward</FormLabel>
                        <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 text-sm text-slate-300 flex items-center">
                            {property?.location?.ward || 'N/A'}
                        </div>
                    </div>

                    <div className="space-y-2">
                         <FormLabel className="text-slate-400">Zip Code</FormLabel>
                         <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 text-sm text-slate-300 flex items-center">
                            {property?.location?.zipCode || lead?.zipCode || 'N/A'}
                        </div>
                    </div>

                    <div className="space-y-2 col-span-2">
                        <FormLabel className="text-slate-400">Street / House number</FormLabel>
                        <div className="relative">
                            <Home className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 pl-9 text-sm text-slate-300 flex items-center">
                                {property?.location?.street || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-3 pb-2 border-b border-slate-800 pt-4">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-medium uppercase tracking-wider text-slate-300">Property Attributes</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <FormLabel className="text-slate-400">Construction Type</FormLabel>
                        <div className="relative">
                            <Hammer className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 pl-9 text-sm text-slate-300 flex items-center">
                                {property?.attributes?.constructionType ? formatEnum(property.attributes.constructionType) : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FormLabel className="text-slate-400">Year Built</FormLabel>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 pl-9 text-sm text-slate-300 flex items-center">
                                {property?.attributes?.yearBuilt || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FormLabel className="text-slate-400">No. Floors</FormLabel>
                        <div className="relative">
                             <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                             <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 pl-9 text-sm text-slate-300 flex items-center">
                                {property?.attributes?.noFloors || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FormLabel className="text-slate-400">Square Meters</FormLabel>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                             <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 pl-9 text-sm text-slate-300 flex items-center">
                                {property?.attributes?.squareMeters || 'N/A'} m²
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 col-span-2">
                        <FormLabel className="text-slate-400">Est. Cost</FormLabel>
                        <div className="relative">
                             <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                             <div className="h-10 w-full rounded-md border border-slate-700 bg-surface-dark px-3 py-2 pl-9 text-sm text-slate-300 flex items-center font-medium text-primary">
                                {property?.valuation?.estimatedConstructionCost 
                                    ? formatCurrency(property.valuation.estimatedConstructionCost)
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                        <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                            <FileText className="h-4 w-4" />
                        </div>
                        <h4 className="text-sm font-medium uppercase tracking-wider text-slate-300">Quote Coverages</h4>
                    </div>

                    <FormField
                        control={form.control}
                        name="coverages"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <CoverageSelector
                                        value={field.value as CoverageSelection[]}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <div className="mt-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Formula Explanation & Premium Breakdown
                        </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">

                        <div className="lg:col-span-2 p-6 space-y-4">
                            <div className="space-y-4 text-xs text-slate-400">
                                {watchedCoverages && watchedCoverages.map((c, idx) => {
                                    const rate = RATES[c.code] || 0;
                                    const basePremium = c.limit * rate;
                                    const discountFactor = calculateDiscount(c.deductible);
                                    const finalPremium = basePremium * discountFactor;

                                    return (
                                        <div key={idx} className="border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between font-bold text-slate-200 mb-1">
                                                <span>{formatEnum(c.code)}</span>
                                                <span>{(rate * 100).toFixed(1)}% Base Rate</span>
                                            </div>
                                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                                <span>Base Premium ({formatCurrency(c.limit)} × {rate})</span>
                                                <span className="font-mono">{formatCurrency(basePremium)}</span>
                                            </div>
                                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-emerald-400">
                                                <span>Discount (Deductible {(c.deductible * 100).toFixed(1)}%)</span>
                                                <span className="font-mono">× {discountFactor.toFixed(4)}</span>
                                            </div>
                                            <div className="grid grid-cols-[1fr_auto] gap-2 items-center font-bold text-white mt-1 pt-1 border-t border-slate-800/30">
                                                <span>Coverage Premium</span>
                                                <span className="font-mono">{formatCurrency(finalPremium)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!watchedCoverages || watchedCoverages.length === 0) && (
                                    <p className="text-center py-4">Select coverages to see calculation details.</p>
                                )}
                            </div>
                        </div>
                        

                        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-6 flex flex-col justify-center relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Net Premium</span>
                                    <span className="text-slate-200">{formatCurrency(estimatedPremium.net)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Tax (VAT 10%)</span>
                                    <span className="text-slate-200">{formatCurrency(estimatedPremium.tax)}</span>
                                </div>
                                <div className="h-px bg-slate-700 my-2" />
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-300 font-medium">Total Premium</span>
                                    <span className="text-2xl font-bold text-emerald-400">{formatCurrency(estimatedPremium.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <Button variant="ghost" type="button" onClick={onCancel} className="text-slate-400">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calculating...
                            </>
                        ) : (
                            "Submit Quote"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};