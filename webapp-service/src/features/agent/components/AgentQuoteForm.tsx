import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calculator, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { CoverageSelection, CoverageSelector } from '@/components/ui/coverage-selector';
import { CoverageCode } from '@/types/enums';
import { CreateQuoteDto } from '@/features/admin/services/quoteService';
import { AgentLeadDto } from '@/features/agent/services/agentService';

const agentQuoteSchema = z.object({
    leadId: z.number(),
    agentId: z.string(),
    propertyAddress: z.string().min(1, "Property address is required"),
    startDate: z.date(),
    endDate: z.date(),
    coverages: z.array(
        z.object({
            code: z.nativeEnum(CoverageCode),
            limit: z.number().positive("Limit must be positive"),
            deductible: z.number().min(0)
        })
    )
        .refine((arr) => arr.some(c => c.code === CoverageCode.FIRE), {
            message: "FIRE coverage is mandatory"
        })
        .refine((arr) => arr.every(c => c.deductible < c.limit), {
            message: "Deductible must be less than limit for all coverages"
        })
});

type AgentQuoteFormValues = z.infer<typeof agentQuoteSchema>;

interface AgentQuoteFormProps {
    lead: AgentLeadDto | null;
    agentId: string;
    onSubmit: (data: CreateQuoteDto) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const AgentQuoteForm: React.FC<AgentQuoteFormProps> = ({
    lead,
    agentId,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const initialAddress = useMemo(() => {
        if (!lead) return '';
        try {
            if (lead.propertyInfo.startsWith('{')) {
                const parsed = JSON.parse(lead.propertyInfo);
                return parsed.address || lead.propertyInfo;
            }
            return lead.propertyInfo;
        } catch {
            return lead.propertyInfo;
        }
    }, [lead]);

    const defaultValues: Partial<AgentQuoteFormValues> = {
        leadId: lead?.leadId,
        agentId: agentId,
        propertyAddress: initialAddress,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        coverages: [
            { code: CoverageCode.FIRE, limit: 10000000000, deductible: 50000000 }
        ]
    };

    const form = useForm<AgentQuoteFormValues>({
        resolver: zodResolver(agentQuoteSchema),
        defaultValues
    });

    const watchedCoverages = form.watch('coverages');
    const totalSumInsured = useMemo(() => {
        return watchedCoverages?.reduce((acc, c) => acc + (c.limit || 0), 0) || 0;
    }, [watchedCoverages]);

    const estimatedPremium = useMemo(() => {
        if (!watchedCoverages) return { net: 0, tax: 0, total: 0 };
        let net = 0;
        watchedCoverages.forEach(c => {
            let rate = 0;
            if (c.code === CoverageCode.FIRE) rate = 0.0005;
            if (c.code === CoverageCode.THEFT) rate = 0.001;
            if (c.code === CoverageCode.NATURAL_DISASTER) rate = 0.002;

            net += (c.limit * rate);
        });
        const tax = net * 0.1;
        return { net, tax, total: net + tax };
    }, [watchedCoverages]);

    const handleSubmit = (data: AgentQuoteFormValues) => {
        const payload: CreateQuoteDto = {
            ...data,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
            endDate: format(data.endDate, 'yyyy-MM-dd'),
            coverages: data.coverages
        };
        onSubmit(payload);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="propertyAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-400">Property Address</FormLabel>
                                    <FormControl>
                                        <Input {...field} readOnly
                                            className="bg-slate-950 border-slate-800 text-slate-300" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-400">Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-slate-950 border-slate-800",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                defaultMonth={field.value}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-400">End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-slate-950 border-slate-800",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                defaultMonth={field.value}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-white">Coverage Selection</h3>
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

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Calculator className="h-5 w-5" />
                        <h4 className="font-semibold">Calculation Preview</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-sm text-slate-400 mb-1">Total Sum Insured</p>
                            <div className="text-2xl font-bold text-white tracking-tight">
                                {formatCurrency(totalSumInsured)}
                            </div>
                        </div>

                        <div className="space-y-2 border-l border-slate-800 pl-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Net Premium (Est.)</span>
                                <span className="text-slate-200">{formatCurrency(estimatedPremium.net)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">VAT (10%)</span>
                                <span className="text-slate-200">{formatCurrency(estimatedPremium.tax)}</span>
                            </div>
                            <div className="h-px bg-slate-800 my-1" />
                            <div className="flex justify-between font-bold">
                                <span className="text-white">Total Premium</span>
                                <span className="text-emerald-400">{formatCurrency(estimatedPremium.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
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