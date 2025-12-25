import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {DialogClose, DialogFooter} from '@/components/ui/dialog';
import {PropertyQuoteDto} from '@/features/admin/services/quoteService';
import {formatCurrency, formatNumber, parseNumber} from '@/lib/utils';
import {Info, Plus, Shield, Trash2, Zap} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {NumberInput} from '@/components/ui/number-input';
import {fetchLeadById} from '@/features/agent/services/agentService';
import {fetchPropertyById} from '@/features/admin/services/propertyService';

export type CoverageCode = 'FIRE' | 'THEFT' | 'NATURAL_DISASTER';

const quoteSchema = z.object({
    leadId: z.number(),
    agentId: z.string().min(1, "Agent ID is required"),
    coverages: z.array(
        z.object({
            code: z.enum(['FIRE', 'THEFT', 'NATURAL_DISASTER']),
            limit: z.number().positive("Limit must be positive"),
            deductible: z.number().min(0).max(1, "Deductible must be between 0 and 1")
        })
    ).min(1, "At least one coverage is required")
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface AgentQuoteFormProps {
    leadId: number;
    agentId: string;
    onSubmit: (data: QuoteFormData) => void;
    onCancel: () => void;
    initialData?: PropertyQuoteDto;
    isPending?: boolean;
}

const RATES: Record<CoverageCode, number> = {
    'FIRE': 0.02,
    'THEFT': 0.015,
    'NATURAL_DISASTER': 0.025
};

const CODES: CoverageCode[] = ['FIRE', 'THEFT', 'NATURAL_DISASTER'];

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

const calculateDiscount = (deductible: number) => {
    if (deductible === 0) return 1;
    return Math.max(0.6, Math.exp(-5 * deductible));
};

export const AgentQuoteForm: React.FC<AgentQuoteFormProps> = ({
                                                                  leadId,
                                                                  agentId,
                                                                  onSubmit,
                                                                  onCancel,
                                                                  initialData,
                                                                  isPending
                                                              }) => {
    const {
        handleSubmit,
        control,
        watch,
        setValue
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema),
        defaultValues: initialData ? {
            leadId: initialData.leadId,
            agentId: initialData.agentId,
            coverages: initialData.coverages.map(c => ({
                code: c.code as CoverageCode,
                limit: c.limit,
                deductible: c.deductible
            }))
        } : {
            leadId,
            agentId,
            coverages: [{code: 'FIRE', limit: 1000000000, deductible: 0}]
        }
    });

    const {data: lead} = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => fetchLeadById(leadId),
        enabled: !!leadId
    });

    const {data: property} = useQuery({
        queryKey: ['property', lead?.propertyInfo],
        queryFn: () => fetchPropertyById(lead?.propertyInfo || ''),
        enabled: !!lead?.propertyInfo
    });

    const watchedCoverages = watch('coverages');

    const addCoverage = () => {
        const current = watchedCoverages || [];
        const usedCodes = new Set(current.map(c => c.code));
        const nextCode = CODES.find(c => !usedCodes.has(c));

        if (nextCode) {
            setValue('coverages', [...current, {code: nextCode, limit: 1000000000, deductible: 0}]);
        }
    };

    const removeCoverage = (idx: number) => {
        const current = watchedCoverages || [];
        if (current.length > 1) {
            setValue('coverages', current.filter((_, i) => i !== idx));
        }
    };

    const calculateTotals = () => {
        if (!watchedCoverages) return {net: 0, tax: 0, total: 0};
        const net = watchedCoverages.reduce((acc, c) => {
            const rate = RATES[c.code as CoverageCode] || 0;
            const discountFactor = calculateDiscount(c.deductible);
            return acc + Math.floor(c.limit * rate * discountFactor);
        }, 0);
        const tax = Math.floor(net * 0.1);
        return {net, tax, total: net + tax};
    };

    const totals = calculateTotals();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5"/>
                <div className="text-sm">
                    <p className="font-medium text-primary mb-1">Quota Configuration</p>
                    <p className="text-text-muted">Set up coverage limits and deductibles for Lead #{leadId}. Base rates
                        are applied automatically.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-text-main flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary"/>
                        Selected Coverages
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCoverage}
                        disabled={watchedCoverages?.length === CODES.length}
                        className="h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    >
                        <Plus className="w-3.5 h-3.5"/>
                        Add Coverage
                    </Button>
                </div>

                <div className="space-y-4">
                    {watchedCoverages?.map((coverage, idx) => (
                        <div key={`${coverage.code}-${idx}`}
                             className="bg-surface-main border border-border-main rounded-xl p-4 space-y-4 relative group">
                            {/* Removed absolute trash button */}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Controller
                                        control={control}
                                        name={`coverages.${idx}.code`}
                                        render={({field}) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="bg-muted border-border-main">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CODES.map(code => (
                                                        <SelectItem
                                                            key={code}
                                                            value={code}
                                                            disabled={watchedCoverages.some((c, i) => c.code === code && i !== idx)}
                                                        >
                                                            {formatEnum(code)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Deductible (%)</Label>
                                    <Controller
                                        control={control}
                                        name={`coverages.${idx}.deductible`}
                                        render={({field}) => (
                                            <div className="relative">
                                                <NumberInput
                                                    value={field.value !== undefined ? Number((field.value * 100).toFixed(1)) : 0}
                                                    onChange={(v) => field.onChange((v ?? 0) / 100)}
                                                    step={0.1}
                                                    min={0}
                                                    max={10.3}
                                                    className="bg-muted border-border-main pr-14"
                                                />
                                                <span
                                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-text-muted font-medium">%</span>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Limit (VND)</Label>
                                        {property?.valuation?.estimatedConstructionCost && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-[10px] text-primary gap-1 hover:bg-primary/10"
                                                onClick={() => setValue(`coverages.${idx}.limit`, property.valuation.estimatedConstructionCost)}
                                            >
                                                <Zap className="w-3 h-3"/>
                                                Get Estimate
                                            </Button>
                                        )}
                                    </div>
                                    <Controller
                                        control={control}
                                        name={`coverages.${idx}.limit`}
                                        render={({field}) => (
                                            <div className="relative">
                                                <NumberInput
                                                    value={field.value}
                                                    onChange={(v) => field.onChange(v ?? 0)}
                                                    format={formatNumber}
                                                    parse={parseNumber}
                                                    className="bg-muted border-border-main pr-16"
                                                />
                                                <span
                                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-text-muted text-xs font-medium">VNĐ</span>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    onClick={() => removeCoverage(idx)}
                                    title="Remove Coverage"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-muted/50 border border-border-main rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>Premium Breakdown</span>
                    <Badge variant="outline"
                           className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Theme discounts applied
                    </Badge>
                </div>

                <div className="space-y-2">
                    {watchedCoverages?.map((c) => {
                        const code = c.code as CoverageCode;
                        const rate = RATES[code] || 0;
                        const basePremium = c.limit * rate;
                        const discountFactor = calculateDiscount(c.deductible);
                        const finalPremium = Math.floor(basePremium * discountFactor);

                        return (
                            <div key={code} className="border-b border-border-main pb-3 last:border-0 last:pb-0">
                                <div className="flex justify-between font-bold text-text-main mb-1">
                                    <span>{formatEnum(code)}</span>
                                    <span>{(rate * 100).toFixed(1)}% Base Rate</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm">
                                    <span
                                        className="text-text-muted">Base Premium ({formatCurrency(c.limit)} × {rate.toFixed(3)})</span>
                                    <span className="font-mono text-text-main">{formatCurrency(basePremium)}</span>
                                </div>
                                {c.deductible > 0 && (
                                    <div
                                        className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm text-emerald-400">
                                        <span>Deductible Discount ({(c.deductible * 100).toFixed(1)}%)</span>
                                        <span
                                            className="font-mono">-{formatCurrency(Math.floor(basePremium) - finalPremium)}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="flex justify-between text-sm text-text-muted pt-2 border-t border-border-main/50">
                        <span>Tax (VAT 10%)</span>
                        <span className="font-mono">{formatCurrency(totals.tax)}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-border-main flex items-center justify-between">
                    <span className="text-lg font-bold text-text-main">Estimated Annual Premium</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(totals.total)}</span>
                </div>
            </div>

            <DialogFooter className="gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}
                        className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                    {isPending ? 'Processing...' : (initialData ? 'Update Quote' : 'Generate Quote')}
                </Button>
            </DialogFooter>
        </form>
    );
};