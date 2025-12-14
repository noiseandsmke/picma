import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {DialogClose, DialogFooter} from '@/components/ui/dialog';
import {SearchableSelect} from '@/components/ui/searchable-select';
import {updateOwnerLead} from '@/features/owner/services/ownerService';
import {ConstructionType, fetchPropertyById, PropertyInfoDto} from '@/features/admin/services/propertyService';
import {toast} from 'sonner';
import {City, VN_LOCATIONS} from '@/lib/vn-locations';
import {NumberInput} from '@/components/ui/number-input';
import {PropertyLeadDto} from '@/features/admin/services/leadService';
import apiClient from '@/services/apiClient';

const constructionTypeValues = ['WOOD', 'CONCRETE', 'HYBRID'] as const;

const updateLeadSchema = z.object({
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
            squareMeters: z.coerce.number().min(0.01, "Square Meters must be positive"),
        }),
        valuation: z.object({
            estimatedConstructionCost: z.coerce.number().min(1, "Cost must be positive"),
        }),
    }),
    expiryDate: z.string().nullable().optional()
});

type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll('_', ' ');
};

interface OwnerLeadUpdateFormProps {
    lead: PropertyLeadDto;
    onSuccess: () => void;
    onCancel: () => void;
}

export const OwnerLeadUpdateForm: React.FC<OwnerLeadUpdateFormProps> = ({lead, onSuccess, onCancel}) => {
    const queryClient = useQueryClient();
    const [selectedCity] = useState<City | null>(VN_LOCATIONS.find(c => c.name === 'Ho Chi Minh City') || null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const {
        handleSubmit,
        control,
        setValue,
        register,
        reset,
        formState: {errors},
    } = useForm<UpdateLeadFormData, any, UpdateLeadFormData>({
        // @ts-expect-error - zod resolver type mismatch
        resolver: zodResolver(updateLeadSchema),
        defaultValues: {
            property: {
                location: {
                    city: 'Ho Chi Minh City',
                    ward: '',
                    zipCode: '',
                    street: '',
                },
                attributes: {} as any,
                valuation: {} as any
            }
        }
    });

    useEffect(() => {
        const loadPropertyData = async () => {
            if (lead.propertyInfo) {
                try {
                    let property: PropertyInfoDto | null = null;
                    if (lead.propertyInfo.startsWith('{')) {
                        property = JSON.parse(lead.propertyInfo);
                    } else {
                        property = await fetchPropertyById(lead.propertyInfo);
                    }

                    if (property) {
                        reset({
                            property: {
                                location: property.location,
                                attributes: {
                                    constructionType: property.attributes.constructionType || 'CONCRETE',
                                    yearBuilt: property.attributes.yearBuilt || new Date().getFullYear(),
                                    noFloors: property.attributes.noFloors,
                                    squareMeters: property.attributes.squareMeters,
                                },
                                valuation: {
                                    estimatedConstructionCost: property.valuation.estimatedConstructionCost
                                }
                            },
                            expiryDate: lead.expiryDate
                        });

                    }
                } catch (e) {
                    console.error("Failed to load property details", e);
                    toast.error("Failed to load property details");
                } finally {
                    setIsLoadingData(false);
                }
            } else {
                setIsLoadingData(false);
            }
        };
        loadPropertyData();
    }, [lead, reset]);

    const updateLeadMutation = useMutation({
        mutationFn: (data: any) => updateOwnerLead(lead.id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['owner-leads']});
            await queryClient.invalidateQueries({queryKey: ['lead-details', lead.id]});
            onSuccess();
            toast.success("Lead updated successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to update lead");
        }
    });

    const onSubmit = async (data: UpdateLeadFormData) => {
        try {


            const propertyPayload = {
                ...data.property,
                attributes: {
                    ...data.property.attributes,
                    constructionType: data.property.attributes.constructionType as ConstructionType,
                }
            };

            const propertyId = lead.propertyInfo;

            if (!propertyId.startsWith('{')) {
                await apiClient.put(`/picma/properties/${propertyId}`, propertyPayload);
            }

            const leadPayload = {
                id: lead.id,
                expiryDate: data.expiryDate,
                propertyInfo: propertyId, status: lead.status,
                userInfo: lead.userInfo
            };

            updateLeadMutation.mutate(leadPayload);

        } catch (error) {
            console.error("Error in lead update flow:", error);
            toast.error("Failed to update lead");
        }
    };


    const wardOptions = selectedCity?.wards.map(w => ({
        value: w.name,
        label: w.name,
        sublabel: w.zipCode
    })) || [];

    if (isLoadingData) {
        return <div className="p-4 text-center">Loading details...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Property Details</h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="hidden">
                        <Input type="hidden" {...register('property.location.city')} value="Ho Chi Minh City"/>
                    </div>

                    <div className="space-y-2">
                        <Label>Ward</Label>
                        <Controller
                            control={control}
                            name="property.location.ward"
                            render={({field}) => (
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
                                    className="bg-surface-dark"
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
                            className="bg-surface-dark border-slate-800 text-slate-400 cursor-not-allowed"
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
                            className="bg-surface-dark border-slate-700 focus:bg-surface-dark active:bg-surface-dark"
                        />
                        {errors.property?.location?.street &&
                            <p className="text-red-500 text-xs">{errors.property.location.street.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="constructionType">Construction type</Label>
                        <Controller
                            control={control}
                            name="property.attributes.constructionType"
                            render={({field}) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-surface-dark border-slate-700 hover:bg-slate-800">
                                        <SelectValue placeholder="Select type"/>
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
                            render={({field}) => (
                                <NumberInput
                                    id="yearBuilt"
                                    value={field.value}
                                    onChange={field.onChange}
                                    min={1800}
                                    placeholder="e.g. 2020"
                                    className="bg-surface-dark border-slate-700"
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
                            render={({field}) => (
                                <NumberInput
                                    id="noFloors"
                                    value={field.value}
                                    onChange={field.onChange}
                                    min={1}
                                    placeholder="0"
                                    className="bg-surface-dark border-slate-700"
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
                            render={({field}) => (
                                <NumberInput
                                    id="squareMeters"
                                    step="0.01"
                                    value={field.value}
                                    onChange={field.onChange}
                                    min={0.01}
                                    placeholder="0"
                                    className="bg-surface-dark border-slate-700"
                                />
                            )}
                        />
                        {errors.property?.attributes?.squareMeters &&
                            <p className="text-red-500 text-xs">{errors.property.attributes.squareMeters.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estimatedConstructionCost">Est. cost</Label>
                        <Controller
                            control={control}
                            name="property.valuation.estimatedConstructionCost"
                            render={({field}) => (
                                <div className="relative">
                                    <NumberInput
                                        id="estimatedConstructionCost"
                                        value={field.value}
                                        onChange={field.onChange}
                                        step={1000000}
                                        min={1}
                                        placeholder="0"
                                        format={(val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                        parse={(val) => Number(val.replace(/\./g, ''))}
                                        className="bg-surface-dark border-slate-700 pr-8"
                                    />
                                    <span
                                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none font-medium">₫</span>
                                </div>
                            )}
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
                        disabled={updateLeadMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {updateLeadMutation.isPending ? 'Updating...' : 'Update Lead'}
                </Button>
            </DialogFooter>
        </form>
    );
};