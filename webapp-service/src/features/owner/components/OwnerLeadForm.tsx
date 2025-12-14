import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { createLead, CreateLeadDto } from '@/features/admin/services/leadService';
import {
    ConstructionType,
    createProperty,
    PropertyInfoDto
} from '@/features/admin/services/propertyService';
import { toast } from 'sonner';
import { City, VN_LOCATIONS } from '@/lib/vn-locations';
import { NumberInput } from '@/components/ui/number-input';
import { useAuth } from '@/context/AuthContext';

const constructionTypeValues = ['WOOD', 'CONCRETE', 'HYBRID'] as const;

const createLeadSchema = z.object({
    property: z.object({
        location: z.object({
            street: z.string().min(1, "Street is required"),
            ward: z.string().min(1, "Ward is required"),
            city: z.string().min(1, "City is required"),
            zipCode: z.string().min(1, "Zip Code is required"),
        }),
        attributes: z.object({
            constructionType: z.enum(constructionTypeValues),
            yearBuilt: z.coerce.number().min(1800, "Year Built must be valid"),
            noFloors: z.coerce.number().min(1, "Number of floors must be at least 1"),
            squareMeters: z.coerce.number().min(1, "Square Meters must be positive"),
        }),
        valuation: z.object({
            estimatedConstructionCost: z.coerce.number().min(0, "Cost must be positive"),
        }),
    })
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

interface OwnerLeadFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const OwnerLeadForm: React.FC<OwnerLeadFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [costDisplay, setCostDisplay] = useState('');

    const {
        handleSubmit,
        control,
        setValue,
        register,
        formState: { errors },
    } = useForm<CreateLeadFormData, any, CreateLeadFormData>({
        // @ts-expect-error - zodResolver type mismatch
        resolver: zodResolver(createLeadSchema),
        defaultValues: {
            property: {
                location: {
                    city: '',
                    ward: '',
                    zipCode: '',
                    street: '',
                },
                attributes: {
                    yearBuilt: new Date().getFullYear(),
                    noFloors: 1,
                    squareMeters: 0,
                    constructionType: 'CONCRETE',
                },
                valuation: {
                    estimatedConstructionCost: 0
                }
            }
        },
    });

    const createPropertyMutation = useMutation({
        mutationFn: createProperty,
    });

    const createLeadMutation = useMutation({
        mutationFn: createLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['owner-leads'] });
            await queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
            onSuccess();
            toast.success("Lead created successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create lead");
        }
    });

    const onSubmit = async (data: z.infer<typeof createLeadSchema>) => {
        try {
            if (!user) {
                toast.error("User not found");
                return;
            }

            const propertyPayload: Omit<PropertyInfoDto, 'id'> = {
                userId: user.id,
                location: data.property.location,
                attributes: {
                    ...data.property.attributes,
                    constructionType: data.property.attributes.constructionType as ConstructionType,
                },
                valuation: data.property.valuation
            };

            const createdProperty = await createPropertyMutation.mutateAsync(propertyPayload);

            const leadPayload: CreateLeadDto = {
                userInfo: user.id,
                propertyInfo: createdProperty.id,
                status: 'ACTIVE',
                userId: user.id
            };

            createLeadMutation.mutate(leadPayload);
        } catch (error) {
            console.error("Error in lead creation flow:", error);
            toast.error("Failed to create property or lead");
        }
    };

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replaceAll(/\D/g, '');
        const val = Number.parseInt(raw || '0', 10);
        setValue('property.valuation.estimatedConstructionCost', val);
        setCostDisplay(val === 0 ? '' : raw.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ₫');
    };

    const wardOptions = selectedCity?.wards.map(w => ({
        value: w.name,
        label: w.name,
        sublabel: w.zipCode
    })) || [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Property Details</h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Controller
                            control={control}
                            name="property.location.city"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        const city = VN_LOCATIONS.find(c => c.name === val) || null;
                                        setSelectedCity(city);
                                        setValue('property.location.ward', '');
                                        setValue('property.location.zipCode', '');
                                    }}
                                >
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VN_LOCATIONS.map(city => (
                                            <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.property?.location?.city &&
                            <p className="text-red-500 text-xs">{errors.property.location.city.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Ward</Label>
                        <Controller
                            control={control}
                            name="property.location.ward"
                            render={({ field }) => (
                                <SearchableSelect
                                    options={wardOptions}
                                    value={field.value}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        const ward = selectedCity?.wards.find(w => w.name === val);
                                        if (ward) {
                                            setValue('property.location.zipCode', ward.zipCode);
                                        }
                                    }}
                                    placeholder={selectedCity ? "Select ward" : "Select city first"}
                                    disabled={!selectedCity}
                                />
                            )}
                        />
                        {errors.property?.location?.ward &&
                            <p className="text-red-500 text-xs">{errors.property.location.ward.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip code</Label>
                        <Input
                            id="zipCode"
                            readOnly
                            className="bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed"
                            {...register('property.location.zipCode')}
                        />
                        {errors.property?.location?.zipCode &&
                            <p className="text-red-500 text-xs">{errors.property.location.zipCode.message}</p>}
                    </div>

                    <div className="space-y-2 col-span-2">
                        <Label>Street / House number</Label>
                        <Input
                            placeholder="e.g. Số 10, Ngõ 5"
                            {...register('property.location.street')}
                            className="bg-slate-900 border-slate-700"
                        />
                        {errors.property?.location?.street &&
                            <p className="text-red-500 text-xs">{errors.property.location.street.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="constructionType">Construction type</Label>
                        <Controller
                            control={control}
                            name="property.attributes.constructionType"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-slate-900 border-slate-700">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {constructionTypeValues.map((type) => (
                                            <SelectItem key={type} value={type}>{formatEnum(type)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.property?.attributes?.constructionType &&
                            <p className="text-red-500 text-xs">{errors.property.attributes.constructionType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="yearBuilt">Year built</Label>
                        <Controller
                            control={control}
                            name="property.attributes.yearBuilt"
                            render={({ field }) => (
                                <NumberInput
                                    id="yearBuilt"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={new Date().getFullYear().toString()}
                                    className="bg-slate-900 border-slate-700"
                                />
                            )}
                        />
                        {errors.property?.attributes?.yearBuilt &&
                            <p className="text-red-500 text-xs">{errors.property.attributes.yearBuilt.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="noFloors">No. floors</Label>
                        <Controller
                            control={control}
                            name="property.attributes.noFloors"
                            render={({ field }) => (
                                <NumberInput
                                    id="noFloors"
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="bg-slate-900 border-slate-700"
                                />
                            )}
                        />
                        {errors.property?.attributes?.noFloors &&
                            <p className="text-red-500 text-xs">{errors.property.attributes.noFloors.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="squareMeters">Square meters</Label>
                        <Controller
                            control={control}
                            name="property.attributes.squareMeters"
                            render={({ field }) => (
                                <NumberInput
                                    id="squareMeters"
                                    step="0.01"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Enter area..."
                                    className="bg-slate-900 border-slate-700"
                                />
                            )}
                        />
                        {errors.property?.attributes?.squareMeters &&
                            <p className="text-red-500 text-xs">{errors.property.attributes.squareMeters.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estimatedConstructionCost">Est. cost</Label>
                        <Input
                            id="estimatedConstructionCost"
                            type="text"
                            value={costDisplay}
                            onChange={handleCostChange}
                            placeholder="0 ₫"
                            className="bg-slate-900 border-slate-700"
                        />
                        {errors.property?.valuation?.estimatedConstructionCost &&
                            <p className="text-red-500 text-xs">{errors.property.valuation.estimatedConstructionCost.message}</p>}
                    </div>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                </DialogClose>
                <Button type="submit"
                    disabled={createLeadMutation.isPending || createPropertyMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {(createLeadMutation.isPending || createPropertyMutation.isPending) ? 'Creating...' : 'Create Lead'}
                </Button>
            </DialogFooter>
        </form>
    );
};