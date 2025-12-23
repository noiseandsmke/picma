import React, {useEffect} from 'react';
import {Controller, SubmitHandler, useFieldArray, useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {DialogFooter} from '@/components/ui/dialog';
import {SearchableSelect} from '@/components/ui/searchable-select';
import {fetchAllLeads, LeadDto} from '../services/leadService';
import {fetchUsers} from '../services/userService';
import {fetchPropertyById} from '../services/propertyService';
import {PropertyQuoteDto} from '../services/quoteService';
import {Home, Shield, User, Wallet, Zap} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {NumberInput} from '@/components/ui/number-input';

const quoteSchema = z.object({
    leadId: z.coerce.number().min(1, 'Lead is required'),
    agentId: z.string().min(1, 'Agent is required'),
    plan: z.enum(['BRONZE', 'SILVER', 'GOLD']),
    coverages: z.array(z.object({
        code: z.enum(['FIRE', 'THEFT', 'NATURAL_DISASTER']),
        limit: z.coerce.number().min(0),
        deductible: z.coerce.number().min(0),
    })),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
    initialData?: PropertyQuoteDto | null;
    onSubmit: (data: QuoteFormData & { premium: { net: number; tax: number; total: number } }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    leads?: LeadDto[];
    hideAgentSelect?: boolean;
    agentId?: string;
    readOnly?: boolean;
    hideLeadInfo?: boolean;
}

const getDefaultCoverages = (plan: string) => {
    const baseFire = {code: 'FIRE', limit: 1000000000, deductible: 0};
    const baseTheft = {code: 'THEFT', limit: 100000000, deductible: 0};
    const baseFlood = {code: 'NATURAL_DISASTER', limit: 1000000000, deductible: 0};

    switch (plan) {
        case 'GOLD':
            return [baseFire, baseTheft, baseFlood] as const;
        case 'SILVER':
            return [baseFire, baseTheft] as const;
        case 'BRONZE':
        default:
            return [baseFire] as const;
    }
};

const RATES: Record<string, number> = {
    'FIRE': 0.02,
    'THEFT': 0.015,
    'NATURAL_DISASTER': 0.025
};

const calculateDiscount = (deductible: number) => {
    if (deductible === 0) return 1.0;
    return Math.max(0.6, Math.exp(-5.0 * deductible));
};

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(val);
};

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onChange?: (value: number) => void;
    compact?: boolean;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(({
                                                                                  value,
                                                                                  onChange,
                                                                                  compact,
                                                                                  className,
                                                                                  ...props
                                                                              }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    React.useEffect(() => {
        if (value !== undefined && value !== null) {
            setDisplayValue(new Intl.NumberFormat('vi-VN').format(value as number));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replaceAll(/\D/g, '');
        const num = raw ? Number.parseInt(raw, 10) : 0;
        setDisplayValue(new Intl.NumberFormat('vi-VN').format(num));
        if (onChange) {
            onChange(num);
        }
    };

    return (
        <div className="relative w-full">
            <input
                {...props}
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                className={cn(
                    "flex h-10 w-full rounded-md border border-border-main bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    compact ? "pr-8 h-8" : "pr-12",
                    className
                )}
            />
            {!compact && (
                <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted text-xs">
                    VNĐ
                </div>
            )}
        </div>
    );
});
CurrencyInput.displayName = "CurrencyInput";

export const QuoteForm: React.FC<QuoteFormProps> = ({
                                                        initialData,
                                                        onSubmit,
                                                        onCancel,
                                                        isLoading,
                                                        leads: propsLeads,
                                                        hideAgentSelect,
                                                        agentId,
                                                        ...props
                                                    }) => {
    const form = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema) as any,
        defaultValues: {
            leadId: initialData?.leadId || 0,
            agentId: initialData?.agentId || agentId || '',
            plan: (initialData as any)?.plan || 'BRONZE',
            coverages: initialData?.coverages?.map(c => ({
                code: c.code as "FIRE" | "THEFT" | "NATURAL_DISASTER",
                limit: c.limit,
                deductible: c.deductible
            })) || [],
        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: {errors},
    } = form;

    const {fields, replace} = useFieldArray({
        control,
        name: "coverages"
    });

    const {data: fetchedLeads} = useQuery({
        queryKey: ['all-leads-for-select'],
        queryFn: () => fetchAllLeads(),
        enabled: !propsLeads
    });

    const leads = propsLeads || fetchedLeads;

    const {data: owners} = useQuery({
        queryKey: ['all-owners-for-select'],
        queryFn: () => fetchUsers('owner'),
    });

    const {data: agents} = useQuery({
        queryKey: ['all-agents-for-select'],
        queryFn: () => fetchUsers('agent'),
        enabled: !hideAgentSelect
    });

    const selectedLeadId = useWatch({control, name: 'leadId'});
    const selectedPlan = useWatch({control, name: 'plan'});

    const selectedLead = leads?.find(l => l.id === selectedLeadId);

    const {data: selectedProperty} = useQuery({
        queryKey: ['property', selectedLead?.propertyInfo],
        queryFn: () => fetchPropertyById(selectedLead?.propertyInfo || ''),
        enabled: !!selectedLead?.propertyInfo,
    });

    const displayAddress = React.useMemo(() => {
        if (!selectedProperty?.location) return '';
        return `${selectedProperty.location.street}, ${selectedProperty.location.ward}, ${selectedProperty.location.city}`;
    }, [selectedProperty]);

    const filteredAgents = React.useMemo(() => {
        if (!selectedProperty || !agents) return [];
        const propertyZip = selectedLead?.zipCode;
        if (!propertyZip) return [];

        return agents.filter(agent => agent.zipcode === propertyZip);
    }, [selectedProperty, agents]);

    useEffect(() => {
        if (hideAgentSelect) return;

        const currentAgentId = getValues('agentId');
        if (!selectedProperty) {
            if (currentAgentId) setValue('agentId', '');
            return;
        }

        if (filteredAgents.length === 0) {
            setValue('agentId', '');
            return;
        }

        if (currentAgentId) {
            const agentExists = filteredAgents.some(a => a.id === currentAgentId);
            if (!agentExists) {
                const isInitialAgent = initialData?.agentId === currentAgentId;
                if (!isInitialAgent) setValue('agentId', '');
            }
        }
    }, [selectedProperty, filteredAgents, setValue, getValues, hideAgentSelect, initialData]);

    useEffect(() => {
        if (fields.length > 0 && initialData?.coverages?.length) {
            return;
        }
        const defaults = getDefaultCoverages(selectedPlan).map(c => ({
            ...c,
            code: c.code as "FIRE" | "THEFT" | "NATURAL_DISASTER"
        }));
        replace(defaults);
    }, [selectedPlan, replace, initialData, fields.length]);

    const calculatePremium = (coverages: QuoteFormData['coverages']) => {
        if (!coverages || coverages.length === 0) return {net: 0, tax: 0, total: 0};

        const net = coverages.reduce((acc, c) => {
            const rate = RATES[c.code] || 0;
            const discountFactor = calculateDiscount(c.deductible);
            return acc + Math.floor(c.limit * rate * discountFactor);
        }, 0);

        const tax = Math.floor(net * 0.1);
        const total = net + tax;

        return {net, tax, total};
    };

    const watchedCoverages = useWatch({control, name: 'coverages'});
    const calculatedPremium = calculatePremium(watchedCoverages);

    const handleFormSubmit: SubmitHandler<QuoteFormData> = (data) => {
        onSubmit({
            ...data,
            premium: calculatedPremium
        });
    };

    const leadOptions = leads?.map(l => {
        const userId = l.userInfo.split(' - ')[0];
        const owner = owners?.find(u => u.id === userId);
        const label = owner
            ? `#${l.id} - ${owner.firstName} ${owner.lastName} (${owner.email})`
            : `Lead #${l.id}`;

        return {
            value: l.id,
            label: label
        };
    }) || [];

    const agentOptions = filteredAgents.map(a => ({
        value: a.id || '',
        label: `${a.firstName} ${a.lastName}`,
        sublabel: `@${a.username} - ${a.zipcode || 'No Zip'}`
    }));

    const getCoverageName = (code: string) => {
        const map: Record<string, string> = {
            'FIRE': 'Fire & Explosion',
            'THEFT': 'Theft & Burglary',
            'NATURAL_DISASTER': 'Natural Disaster'
        };
        return map[code] || code;
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-border-main pb-2">
                        <User size={14} className="text-primary"/> General info
                    </h4>

                    <div className="space-y-3">
                        {!props.hideLeadInfo && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Lead</Label>
                                <Controller
                                    name="leadId"
                                    control={control}
                                    render={({field}) => (
                                        <SearchableSelect
                                            options={leadOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Search client..."
                                            isLoading={!leads}
                                            disabled={props.readOnly}
                                        />
                                    )}
                                />
                                {errors.leadId && <p className="text-red-500 text-[10px]">{errors.leadId.message}</p>}
                            </div>
                        )}

                        {!hideAgentSelect && (
                            <div className="space-y-1.5">
                                <Label
                                    className="text-xs">Agent {selectedLead && `(Zip: ${selectedLead.zipCode})`}</Label>
                                <Controller
                                    name="agentId"
                                    control={control}
                                    render={({field}) => (
                                        <SearchableSelect
                                            options={agentOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={
                                                !selectedProperty
                                                    ? "Select lead first..."
                                                    : (agentOptions.length > 0 ? "Select agent..." : "No agents found in this zipcode")
                                            }
                                            disabled={!selectedProperty || agentOptions.length === 0 || props.readOnly}
                                            isLoading={!agents}
                                        />
                                    )}
                                />
                                {errors.agentId && <p className="text-red-500 text-[10px]">{errors.agentId.message}</p>}
                                {selectedProperty && agentOptions.length === 0 && (
                                    <p className="text-amber-500 text-[10px]">No agents found for property
                                        zipcode {selectedLead?.zipCode}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-border-main pb-2">
                        <Home size={14} className="text-emerald-400"/> Property & plan
                    </h4>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Property address</Label>
                            <Input
                                value={displayAddress}
                                readOnly
                                placeholder="Address will auto-fill from Lead"
                                className="bg-muted border-border-main h-9 text-xs opacity-70"
                                disabled={true}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Insurance plan</Label>
                            <Controller
                                name="plan"
                                control={control}
                                render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}
                                            disabled={props.readOnly}>
                                        <SelectTrigger className="bg-muted border-border-main h-9 text-xs">
                                            <SelectValue placeholder="Select plan"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface-main border-border-main text-text-main">
                                            <SelectItem value="BRONZE">Bronze (Fire only)</SelectItem>
                                            <SelectItem value="SILVER">Silver (Fire + Theft)</SelectItem>
                                            <SelectItem value="GOLD">Gold (Comprehensive)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-border-main pb-2">
                        <Shield size={14} className="text-amber-400"/> Coverages & deductibles
                    </h4>

                    <div className="rounded-md border border-border-main bg-surface-main overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border-main hover:bg-muted/50">
                                    <TableHead className="h-8 text-[10px] w-[80px]">Coverage</TableHead>
                                    <TableHead className="h-8 text-[10px]">Limit</TableHead>
                                    <TableHead className="h-8 text-[10px]">Deductible</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-[10px] text-text-muted py-4">
                                            Select plan & sum insured
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fields.map((field, index) => (
                                        <TableRow key={field.id} className="border-border-main hover:bg-muted/30">
                                            <TableCell className="p-2 align-top">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-semibold text-[10px] text-text-secondary">{field.code}</span>
                                                    <span className="text-[9px] text-text-muted truncate max-w-[70px]"
                                                          title={getCoverageName(field.code)}>
                                                        {getCoverageName(field.code)}
                                                    </span>
                                                    <input
                                                        type="hidden"
                                                        {...control.register(`coverages.${index}.code` as const)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <div className="flex items-center gap-1 group/limit">
                                                    <Controller
                                                        name={`coverages.${index}.limit` as const}
                                                        control={control}
                                                        render={({field}) => (
                                                            <CurrencyInput
                                                                {...field}
                                                                compact
                                                                className="h-6 text-[10px] bg-muted border-border-main px-1 text-right"
                                                                disabled={props.readOnly}
                                                            />
                                                        )}
                                                    />
                                                    {selectedProperty?.valuation?.estimatedConstructionCost && !props.readOnly && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-primary hover:bg-primary/10 shrink-0"
                                                            onClick={() => setValue(`coverages.${index}.limit`, selectedProperty.valuation.estimatedConstructionCost)}
                                                            title="Get estimated construction cost"
                                                        >
                                                            <Zap className="w-3 h-3"/>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Controller
                                                    name={`coverages.${index}.deductible` as const}
                                                    control={control}
                                                    render={({field}) => (
                                                        <div className="relative w-full">
                                                            <NumberInput
                                                                value={field.value ? Number((field.value * 100).toFixed(1)) : 0}
                                                                onChange={(v) => field.onChange((v ?? 0) / 100)}
                                                                step={0.1}
                                                                min={0}
                                                                max={10.3}
                                                                className="h-6 text-[10px] bg-muted border-border-main px-1 text-right pr-6"
                                                                disabled={props.readOnly}
                                                            />
                                                            <div
                                                                className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-text-muted text-[10px]">
                                                                %
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <div className="col-span-1 lg:col-span-2 mt-4">
                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Wallet size={20}/>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-sky-200">Estimated premium</p>
                                    <p className="text-xs text-primary/60">Auto-calculated based on Plan rate</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 md:gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-text-muted font-bold tracking-wider">Net
                                        (Sum of coverages)</p>
                                    <p className="text-sm font-medium text-text-secondary">{formatCurrency(calculatedPremium.net)}</p>
                                </div>
                                <div className="text-border-main font-bold text-lg pt-3">+</div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-text-muted font-bold tracking-wider">VAT
                                        (10%)</p>
                                    <p className="text-sm font-medium text-text-secondary">{formatCurrency(calculatedPremium.tax)}</p>
                                </div>
                                <div className="text-border-main font-bold text-lg pt-3">=</div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-emerald-500/80 font-bold tracking-wider">Total</p>
                                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(calculatedPremium.total)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!props.readOnly && (
                        <DialogFooter className="mt-6 gap-2">
                            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}
                                    className="bg-primary hover:bg-primary-hover text-white min-w-[120px]">
                                {initialData ? 'Save changes' : 'Create quote'}
                            </Button>
                        </DialogFooter>
                    )}
                </div>
            </div>
        </form>
    );
};