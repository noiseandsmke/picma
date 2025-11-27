import React, {useEffect} from 'react';
import {Controller, useFieldArray, useForm, useWatch} from 'react-hook-form';
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
import {CalendarIcon, Home, Plus, Trash2, User, Wallet} from 'lucide-react';
import {addYears, format} from 'date-fns';
import {cn} from '@/lib/utils';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';

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
    // Premium is calculated, not input
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
    initialData?: PropertyQuoteDto | null;
    onSubmit: (data: QuoteFormData & { premium: { net: number; tax: number; total: number } }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

// Helper for default coverages based on plan
const getDefaultCoverages = (plan: string, sumInsured: number) => {
    const baseFire = {code: 'FIRE', limit: sumInsured, deductible: 2000000};
    const baseTheft = {code: 'THEFT', limit: Math.min(sumInsured * 0.1, 50000000), deductible: 500000};
    const baseFlood = {code: 'FLOOD', limit: sumInsured, deductible: 5000000};

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

// Simple Currency Input Component
const CurrencyInput = React.forwardRef<HTMLInputElement, any>(({value, onChange, ...props}, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    React.useEffect(() => {
        if (value !== undefined && value !== null) {
            setDisplayValue(new Intl.NumberFormat('vi-VN').format(value));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        const num = raw ? parseInt(raw, 10) : 0;
        setDisplayValue(new Intl.NumberFormat('vi-VN').format(num));
        onChange(num);
    };

    return (
        <div className="relative">
            <Input
                {...props}
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                className="pr-12" // Space for suffix
            />
            <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 text-sm">
                VNĐ
            </div>
        </div>
    );
});

export const QuoteForm: React.FC<QuoteFormProps> = ({initialData, onSubmit, onCancel, isLoading}) => {
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: {errors},
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema) as any,
        defaultValues: {
            leadId: initialData?.leadId || 0,
            agentId: initialData?.agentId || '',
            plan: (initialData?.plan as any) || 'BRONZE',
            propertyAddress: initialData?.propertyAddress || '',
            sumInsured: initialData?.sumInsured || 0,
            startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
            endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
            coverages: initialData?.coverages || [],
        },
    });

    const {fields, append, remove, replace} = useFieldArray({
        control,
        name: "coverages"
    });

    // 1. Fetch Options
    const {data: leads} = useQuery({
        queryKey: ['all-leads-for-select'],
        queryFn: () => fetchAllLeads(),
    });

    const {data: agents} = useQuery({
        queryKey: ['all-agents-for-select'],
        queryFn: () => fetchUsers('agent'),
    });

    // 2. Watch Values
    const selectedLeadId = useWatch({control, name: 'leadId'});
    const selectedPlan = useWatch({control, name: 'plan'});
    const sumInsured = useWatch({control, name: 'sumInsured'});
    const startDate = useWatch({control, name: 'startDate'});

    // 3. Fetch Selected Lead Details to autofill
    const selectedLead = leads?.find(l => l.id === selectedLeadId);

    // 4. Fetch Property Details if Lead is selected
    const {data: selectedProperty} = useQuery({
        queryKey: ['property', selectedLead?.propertyInfo],
        queryFn: () => fetchPropertyById(selectedLead!.propertyInfo),
        enabled: !!selectedLead?.propertyInfo,
    });

    // Autofill Address when Property is loaded and Address is empty
    useEffect(() => {
        if (selectedProperty && !initialData) {
            const currentAddress = getValues('propertyAddress');
            if (!currentAddress) {
                const addr = `${selectedProperty.location.street}, ${selectedProperty.location.ward}, ${selectedProperty.location.city}`;
                setValue('propertyAddress', addr);
            }
        }
    }, [selectedProperty, setValue, getValues, initialData]);

    // Auto-calculate End Date
    useEffect(() => {
        if (startDate && !getValues('endDate')) {
            setValue('endDate', addYears(startDate, 1));
        }
    }, [startDate, setValue, getValues]);

    // Auto-populate Coverages when Plan changes (only if creating new or user agrees? For now, we update if empty or simple change)
    // We only update if this is not the initial load of an edit form, or if we want to force update.
    // To avoid overwriting custom edits, we could check if coverages is empty.
    useEffect(() => {
        if (!initialData && sumInsured > 0) {
            // Logic: If creating new, auto-fill coverages based on Plan + SumInsured
            // Or if user changes plan, we might want to refresh coverages
            const defaults = getDefaultCoverages(selectedPlan, sumInsured);
            replace(defaults);
        }
    }, [selectedPlan, replace, initialData]); // removed sumInsured to prevent overwrite loop if sum changes, only plan

    // 5. Live Premium Calculation
    const calculatePremium = (plan: string, sum: number) => {
        let rate = 0.001; // Base rate
        if (plan === 'SILVER') rate = 0.0012;
        if (plan === 'GOLD') rate = 0.0015;

        const net = Math.round(sum * rate);
        const tax = Math.round(net * 0.1);
        const total = net + tax;

        return {net, tax, total};
    };

    const calculatedPremium = calculatePremium(selectedPlan, sumInsured);

    // 6. Handle "Use Lead Valuation"
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

    const setQuickDuration = (years: number) => {
        if (startDate) {
            setValue('endDate', addYears(startDate, years));
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: General Info & Property (Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* SECTION 1: General Info */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <User size={14}/> General Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            placeholder="Search client..."
                                            isLoading={!leads}
                                        />
                                    )}
                                />
                                {errors.leadId && <p className="text-red-500 text-sm">{errors.leadId.message}</p>}
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

                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({field}) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-slate-950 border-slate-700",
                                                        !field.value && "text-slate-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                                    {field.value ? format(field.value, "PPP") :
                                                        <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-slate-950 border-slate-800"
                                                            align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    className="bg-slate-950 text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>End Date</Label>
                                    <div className="flex gap-1">
                                        <span onClick={() => setQuickDuration(1)}
                                              className="text-[10px] text-indigo-400 cursor-pointer hover:underline">1Y</span>
                                        <span className="text-[10px] text-slate-600">|</span>
                                        <span onClick={() => setQuickDuration(2)}
                                              className="text-[10px] text-indigo-400 cursor-pointer hover:underline">2Y</span>
                                    </div>
                                </div>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({field}) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-slate-950 border-slate-700",
                                                        !field.value && "text-slate-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                                    {field.value ? format(field.value, "PPP") :
                                                        <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-slate-950 border-slate-800"
                                                            align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    className="bg-slate-950 text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Property & Plan */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <Home size={14}/> Property & Plan
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Property Address</Label>
                                <Input
                                    {...control.register('propertyAddress')}
                                    placeholder="e.g. 123 Nguyen Hue, Ben Nghe, Dist 1, HCMC"
                                    className="bg-slate-950 border-slate-700"
                                />
                                {errors.propertyAddress &&
                                    <p className="text-red-500 text-sm">{errors.propertyAddress.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Sum Insured</Label>
                                    {(selectedProperty || selectedLead?.valuation) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 text-[10px] text-indigo-400 px-0 hover:bg-transparent hover:text-indigo-300"
                                            onClick={handleUseValuation}
                                        >
                                            Use Valuation
                                        </Button>
                                    )}
                                </div>
                                <Controller
                                    name="sumInsured"
                                    control={control}
                                    render={({field}) => (
                                        <CurrencyInput
                                            {...field}
                                            className="bg-slate-950 border-slate-700"
                                        />
                                    )}
                                />
                                {errors.sumInsured &&
                                    <p className="text-red-500 text-sm">{errors.sumInsured.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Insurance Plan</Label>
                                <Controller
                                    name="plan"
                                    control={control}
                                    render={({field}) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="bg-slate-950 border-slate-700">
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
                </div>

                {/* Right Column: Coverages & Premium (Span 1) */}
                <div className="space-y-6">

                    {/* SECTION 3: Coverages */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4 h-full">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Coverages</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => append({code: 'NEW', limit: 0, deductible: 0})}
                                className="h-6 w-6 p-0 hover:bg-slate-800"
                            >
                                <Plus size={14}/>
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {fields.map((field, index) => (
                                <div key={field.id}
                                     className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 relative group">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12}/>
                                    </button>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-500">Coverage Code</Label>
                                        <Input
                                            {...control.register(`coverages.${index}.code`)}
                                            className="h-7 text-xs bg-slate-900 border-slate-800"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-slate-500">Limit</Label>
                                            <Controller
                                                name={`coverages.${index}.limit`}
                                                control={control}
                                                render={({field}) => (
                                                    <CurrencyInput
                                                        {...field}
                                                        className="h-7 text-xs bg-slate-900 border-slate-800 pr-1"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-slate-500">Deductible</Label>
                                            <Controller
                                                name={`coverages.${index}.deductible`}
                                                control={control}
                                                render={({field}) => (
                                                    <CurrencyInput
                                                        {...field}
                                                        className="h-7 text-xs bg-slate-900 border-slate-800 pr-1"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div
                                    className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded">
                                    No coverages defined
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer: Premium (Full Width) */}
                <div className="col-span-1 lg:col-span-3">
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-indigo-400">
                                <div className="p-2 bg-indigo-500/10 rounded-full">
                                    <Wallet size={20}/>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-indigo-300">Estimated Premium</p>
                                    <p className="text-xs text-indigo-400/60">Based on Plan & Sum Insured</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 md:gap-12">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Net
                                        Premium</p>
                                    <p className="text-sm font-medium text-slate-300">{formatCurrency(calculatedPremium.net)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">VAT
                                        (10%)</p>
                                    <p className="text-sm font-medium text-slate-300">{formatCurrency(calculatedPremium.tax)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-emerald-500/80 font-bold tracking-wider">Total
                                        Payment</p>
                                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(calculatedPremium.total)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {initialData ? 'Save Changes' : 'Create Quote'}
                        </Button>
                    </DialogFooter>
                </div>
            </div>
        </form>
    );
};