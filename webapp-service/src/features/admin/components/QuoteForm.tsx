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
import {CalendarIcon, Home, Shield, User, Wallet} from 'lucide-react';
import {addYears, format} from 'date-fns';
import {cn} from '@/lib/utils';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const quoteSchema = z.object({
    leadId: z.coerce.number().min(1, 'Lead is required'),
    agentId: z.string().min(1, 'Agent is required'),
    plan: z.enum(['BRONZE', 'SILVER', 'GOLD']),
    propertyAddress: z.string().min(1, 'Property Address is required'),
    sumInsured: z.coerce.number().positive('Sum Insured must be positive'),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    coverages: z.array(z.object({
        code: z.string().min(1, 'Code required'),
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

const getDefaultCoverages = (plan: string, sumInsured: number) => {
    const baseFire = {code: 'FIRE', limit: sumInsured, deductible: 2000000};
    const baseTheft = {code: 'THEFT', limit: Math.min(sumInsured * 0.1, 50000000), deductible: 500000};
    const baseFlood = {code: 'NATURAL_DISASTER', limit: sumInsured, deductible: 5000000};

    switch (plan) {
        case 'GOLD':
            return [baseFire, baseTheft, baseFlood];
        case 'SILVER':
            return [baseFire, baseTheft];
        case 'BRONZE':
        default:
            return [baseFire];
    }
};

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(val);
};

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
            // @ts-expect-error - onChange typing is incompatible with react-hook-form sometimes
            onChange(num);
        }
    };

    return (
        <div className="relative w-full">
            <Input
                {...props}
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                className={cn(compact ? "pr-8" : "pr-12", className)}
            />
            {!compact && (
                <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 text-xs">
                    VNĐ
                </div>
            )}
        </div>
    );
});

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
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: {errors},
    } = useForm<QuoteFormData, any, QuoteFormData>({
        // @ts-expect-error - zodResolver type mismatch
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            leadId: initialData?.leadId || 0,
            agentId: initialData?.agentId || agentId || '',
            // @ts-expect-error - enum type mismatch with string
            plan: initialData?.plan || 'BRONZE',
            propertyAddress: initialData?.propertyAddress || '',
            sumInsured: initialData?.sumInsured || 0,
            startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
            endDate: initialData?.endDate ? new Date(initialData.endDate) : addYears(new Date(), 1),
            coverages: initialData?.coverages || [],
        },
    });

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
    const sumInsured = useWatch({control, name: 'sumInsured'});
    const startDate = useWatch({control, name: 'startDate'});

    const selectedLead = leads?.find(l => l.id === selectedLeadId);

    const {data: selectedProperty} = useQuery({
        queryKey: ['property', selectedLead?.propertyInfo],
        queryFn: () => fetchPropertyById(selectedLead?.propertyInfo || ''),
        enabled: !!selectedLead?.propertyInfo,
    });

    const filteredAgents = React.useMemo(() => {
        if (!selectedProperty || !agents) return [];
        const propertyZip = selectedProperty.location.zipCode;
        if (!propertyZip) return [];

        return agents.filter(agent => agent.zipcode === propertyZip);
    }, [selectedProperty, agents]);

    useEffect(() => {
        if (!hideAgentSelect) {
            const currentAgentId = getValues('agentId');


            if (currentAgentId && filteredAgents.length > 0) {
                const agentExists = filteredAgents.some(a => a.id === currentAgentId);
                if (!agentExists) {
                    if (initialData?.agentId === currentAgentId) {
                        const isInitialAgent = initialData?.agentId === currentAgentId;
                        if (!isInitialAgent) setValue('agentId', '');
                    } else {
                        setValue('agentId', '');
                    }
                }
            } else if (selectedProperty && filteredAgents.length === 0) {
                setValue('agentId', '');
            }
        }
    }, [selectedProperty, filteredAgents, setValue, getValues, hideAgentSelect, initialData]);


    useEffect(() => {
        if (!initialData && selectedProperty) {
            const currentAddress = getValues('propertyAddress');
            if (!currentAddress) {
                const addr = `${selectedProperty.location.street}, ${selectedProperty.location.ward}, ${selectedProperty.location.city}`;
                setValue('propertyAddress', addr);
            }
        }
    }, [selectedProperty, setValue, getValues, initialData]);

    useEffect(() => {
        if (startDate && !getValues('endDate')) {
            setValue('endDate', addYears(startDate, 1));
        }
    }, [startDate, setValue, getValues]);


    useEffect(() => {
        if (sumInsured > 0) {
            const isInitialLoad = initialData?.plan === selectedPlan && initialData?.sumInsured === sumInsured;

            if (isInitialLoad && fields.length > 0) {
                return;
            }

            const defaults = getDefaultCoverages(selectedPlan, sumInsured);
            replace(defaults);
        }
    }, [selectedPlan, sumInsured, replace, initialData, fields.length]);

    const getPremiumRate = (plan: string) => {
        switch (plan) {
            case 'SILVER':
                return 0.02;
            case 'GOLD':
                return 0.03;
            default:
                return 0.01;
        }
    };

    const getRateDisplay = (plan: string) => {
        const rate = getPremiumRate(plan);
        return `${Number((rate * 100).toFixed(2))}%`;
    };

    const calculatePremium = (plan: string, sum: number) => {
        const rate = getPremiumRate(plan);
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
            if (typeof selectedLead.valuation === 'number') {
                setValue('sumInsured', selectedLead.valuation);
            }
        }
    };

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

    const setQuickDuration = (years: number) => {
        if (startDate) {
            setValue('endDate', addYears(startDate, years));
        }
    };

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
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                        <User size={14} className="text-indigo-400"/> General info
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
                                    className="text-xs">Agent {selectedProperty && `(Zip: ${selectedProperty.location.zipCode})`}</Label>
                                <Controller
                                    name="agentId"
                                    control={control}
                                    render={({field}) => (
                                        <SearchableSelect
                                            options={agentOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder={selectedProperty ? (agentOptions.length > 0 ? "Select agent..." : "No agents found in this zipcode") : "Select lead first..."}
                                            disabled={!selectedProperty || agentOptions.length === 0 || props.readOnly}
                                            isLoading={!agents}
                                        />
                                    )}
                                />
                                {errors.agentId && <p className="text-red-500 text-[10px]">{errors.agentId.message}</p>}
                                {selectedProperty && agentOptions.length === 0 && (
                                    <p className="text-amber-500 text-[10px]">No agents found for property
                                        zipcode {selectedProperty.location.zipCode}</p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Start date</Label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({field}) => (
                                        <Popover>
                                            <PopoverTrigger asChild disabled={props.readOnly}>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-slate-950 border-slate-700 h-9 text-xs px-2",
                                                        !field.value && "text-slate-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-3 w-3"/>
                                                    {field.value ? format(field.value, "dd/MM/yyyy") :
                                                        <span>Pick date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-slate-950 border-slate-800"
                                                            align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    autoFocus
                                                    className="bg-slate-950 text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs">End date</Label>
                                    <div className="flex gap-1">
                                        {!props.readOnly && (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setQuickDuration(1)}
                                                    className="h-4 px-1 text-[10px] text-indigo-400 hover:underline bg-indigo-950/30 rounded hover:bg-indigo-950/50"
                                                >
                                                    1Y
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setQuickDuration(2)}
                                                    className="h-4 px-1 text-[10px] text-indigo-400 hover:underline bg-indigo-950/30 rounded hover:bg-indigo-950/50"
                                                >
                                                    2Y
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({field}) => (
                                        <Popover>
                                            <PopoverTrigger asChild disabled={props.readOnly}>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-slate-950 border-slate-700 h-9 text-xs px-2",
                                                        !field.value && "text-slate-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-3 w-3"/>
                                                    {field.value ? format(field.value, "dd/MM/yyyy") :
                                                        <span>Pick date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-slate-950 border-slate-800"
                                                            align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    autoFocus
                                                    className="bg-slate-950 text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Home size={14} className="text-emerald-400"/> Property & plan
                    </h4>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Property address</Label>
                            <Input
                                {...control.register('propertyAddress')}
                                placeholder="Enter full address"
                                className="bg-slate-950 border-slate-700 h-9 text-xs"
                                disabled={props.readOnly}
                            />
                            {errors.propertyAddress &&
                                <p className="text-red-500 text-[10px]">{errors.propertyAddress.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs">Sum insured</Label>
                                {(selectedProperty || selectedLead?.valuation) && !props.readOnly && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 text-[10px] text-indigo-400 px-0 hover:bg-transparent hover:text-indigo-300"
                                        onClick={handleUseValuation}
                                    >
                                        Use valuation
                                    </Button>
                                )}
                            </div>
                            <Controller
                                name="sumInsured"
                                control={control}
                                render={({field}) => (
                                    <CurrencyInput
                                        {...field}
                                        className="bg-slate-950 border-slate-700 h-9 text-xs"
                                        disabled={props.readOnly}
                                    />
                                )}
                            />
                            {errors.sumInsured &&
                                <p className="text-red-500 text-[10px]">{errors.sumInsured.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Insurance plan</Label>
                            <Controller
                                name="plan"
                                control={control}
                                render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}
                                            disabled={props.readOnly}>
                                        <SelectTrigger className="bg-slate-900 border-slate-700 h-9 text-xs">
                                            <SelectValue placeholder="Select plan"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
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
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Shield size={14} className="text-amber-400"/> Coverages & deductibles
                    </h4>

                    <div className="rounded-md border border-slate-800 bg-slate-950 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="h-8 text-[10px] w-[80px]">Coverage</TableHead>
                                    <TableHead className="h-8 text-[10px]">Limit</TableHead>
                                    <TableHead className="h-8 text-[10px]">Deductible</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-[10px] text-slate-500 py-4">
                                            Select plan & sum insured
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fields.map((field, index) => (
                                        <TableRow key={field.id} className="border-slate-800 hover:bg-slate-900/30">
                                            <TableCell className="p-2 align-top">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="font-semibold text-[10px] text-slate-300">{field.code}</span>
                                                    <span className="text-[9px] text-slate-500 truncate max-w-[70px]"
                                                          title={getCoverageName(field.code)}>
                                                        {getCoverageName(field.code)}
                                                    </span>
                                                    <input
                                                        type="hidden"
                                                        {...control.register(`coverages.${index}.code`)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Controller
                                                    name={`coverages.${index}.limit`}
                                                    control={control}
                                                    render={({field}) => (
                                                        <CurrencyInput
                                                            {...field}
                                                            compact
                                                            className="h-6 text-[10px] bg-slate-900 border-slate-800 px-1 text-right"
                                                            disabled={props.readOnly}
                                                        />
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="p-2">
                                                <Controller
                                                    name={`coverages.${index}.deductible`}
                                                    control={control}
                                                    render={({field}) => (
                                                        <CurrencyInput
                                                            {...field}
                                                            compact
                                                            className="h-6 text-[10px] bg-slate-900 border-slate-800 px-1 text-right"
                                                            disabled={props.readOnly}
                                                        />
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
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-indigo-400">
                                <div className="p-2 bg-indigo-500/10 rounded-full">
                                    <Wallet size={20}/>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-indigo-300">Estimated premium</p>
                                    <p className="text-xs text-indigo-400/60">Auto-calculated based on Plan rate</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 md:gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Net
                                        ({getRateDisplay(selectedPlan)})</p>
                                    <p className="text-sm font-medium text-slate-300">{formatCurrency(calculatedPremium.net)}</p>
                                </div>
                                <div className="text-slate-600 font-bold text-lg pt-3">+</div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">VAT
                                        (10%)</p>
                                    <p className="text-sm font-medium text-slate-300">{formatCurrency(calculatedPremium.tax)}</p>
                                </div>
                                <div className="text-slate-600 font-bold text-lg pt-3">=</div>
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
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                                {initialData ? 'Save changes' : 'Create quote'}
                            </Button>
                        </DialogFooter>
                    )}
                </div>
            </div>
        </form>
    );
};