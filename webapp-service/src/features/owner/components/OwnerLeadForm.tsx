import React, {useState} from 'react';
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
import {createLead, CreateLeadDto, PropertyLeadDto, updateLead} from '@/features/admin/services/leadService';
import {
    ConstructionType,
    createProperty,
    PropertyInfoDto,
    updateProperty
} from '@/features/admin/services/propertyService';
import {toast} from 'sonner';
import {City, VN_LOCATIONS} from '@/lib/vn-locations';
import {NumberInput} from '@/components/ui/number-input';
import {formatNumber, parseNumber} from '@/lib/utils';
import {useAuth} from '@/context/AuthContext';
import {Activity, Building2, Calendar, FileText, Hammer, Hash, Home, Layers, MapPin, Ruler, Wallet} from 'lucide-react';
import {Badge} from '@/components/ui/badge';

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
            squareMeters: z.coerce.number().min(0.01, "Square Meters must be positive"),
        }),
        valuation: z.object({
            estimatedConstructionCost: z.coerce.number().min(1, "Cost must be positive"),
        }),
    })
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

const formatEnum = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase().replaceAll(/_/g, ' ');
};

interface OwnerLeadFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialLead?: PropertyLeadDto;
    initialProperty?: PropertyInfoDto;
    onDelete?: () => void;
}

export const OwnerLeadForm: React.FC<OwnerLeadFormProps> = ({
                                                                onSuccess,
                                                                onCancel,
                                                                initialLead,
                                                                initialProperty,
                                                                onDelete
                                                            }) => {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const [selectedCity] = useState<City | null>(() => {
        const cityName = initialProperty?.location?.city;
        if (cityName) {
            return VN_LOCATIONS.find(c => c.name === cityName) ||
                VN_LOCATIONS.find(c => c.name === 'Ho Chi Minh City') ||
                null;
        }
        return VN_LOCATIONS.find(c => c.name === 'Ho Chi Minh City') || null;
    });

    const findLocationByZip = (zip: string) => {
        if (!zip) return null;
        for (const city of VN_LOCATIONS) {
            const ward = city.wards.find(w => w.zipCode === zip);
            if (ward) return {city: city.name, ward: ward.name, zipCode: ward.zipCode};
        }
        return null;
    };

    const resolvedLocation = React.useMemo(() => {
        if (initialLead?.zipCode) {
            const fromZip = findLocationByZip(initialLead.zipCode);
            if (fromZip) return fromZip;
        }

        if (initialProperty?.location?.ward && initialProperty?.location?.city) {
            return {
                city: initialProperty.location.city,
                ward: initialProperty.location.ward,
                zipCode: initialProperty.location.city === 'Ho Chi Minh City'
                    ? VN_LOCATIONS.find(c => c.name === 'Ho Chi Minh City')?.wards.find(w => w.name === initialProperty.location.ward)?.zipCode || ''
                    : ''
            };
        }

        return {city: 'Ho Chi Minh City', ward: '', zipCode: ''};
    }, [initialProperty, initialLead]);

    const form = useForm<CreateLeadFormData>({
        resolver: zodResolver(createLeadSchema) as any,
        defaultValues: {
            property: {
                location: {
                    city: resolvedLocation.city,
                    ward: resolvedLocation.ward,
                    zipCode: resolvedLocation.zipCode || initialLead?.zipCode || '',
                    street: initialProperty?.location?.street || '',
                },
                attributes: {
                    yearBuilt: initialProperty?.attributes?.yearBuilt || new Date().getFullYear(),
                    noFloors: initialProperty?.attributes?.noFloors || 1,
                    squareMeters: initialProperty?.attributes?.squareMeters || 1,
                    constructionType: (initialProperty?.attributes?.constructionType as any) || 'CONCRETE',
                },
                valuation: {
                    estimatedConstructionCost: initialProperty?.valuation?.estimatedConstructionCost || 1000000
                }
            }
        },
    });

    const {
        handleSubmit,
        control,
        setValue,
        register,
        formState,
        formState: {errors},
    } = form;

    const createPropertyMutation = useMutation({
        mutationFn: createProperty,
    });

    const updatePropertyMutation = useMutation({
        mutationFn: (variables: {
            id: string,
            data: Omit<PropertyInfoDto, 'id'>
        }) => updateProperty(variables.id, variables.data),
    });

    const createLeadMutation = useMutation({
        mutationFn: createLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['owner-leads']});
            await queryClient.invalidateQueries({queryKey: ['owner-properties']});
            onSuccess();
            toast.success("Lead created successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create lead");
        }
    });

    const updateLeadMutation = useMutation({
        mutationFn: updateLead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['owner-leads']});
            await queryClient.invalidateQueries({queryKey: ['owner-properties']});
            await queryClient.invalidateQueries({queryKey: ['property-details']});
            onSuccess();
            toast.success("Lead updated successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to update lead");
        }
    });

    const onSubmit = async (data: CreateLeadFormData) => {
        try {
            if (!user) {
                toast.error("User not found");
                return;
            }

            const propertyPayload: Omit<PropertyInfoDto, 'id'> = {
                userId: user.id,
                location: {
                    street: data.property.location.street,
                    ward: data.property.location.ward,
                    city: data.property.location.city,
                },
                attributes: {
                    ...data.property.attributes,
                    constructionType: data.property.attributes.constructionType as ConstructionType,
                },
                valuation: data.property.valuation
            };

            let propertyId = initialProperty?.id;

            if (initialProperty) {
                const isPropertyDirty = !!formState.dirtyFields.property;

                if (isPropertyDirty) {
                    await updatePropertyMutation.mutateAsync({
                        id: initialProperty.id,
                        data: propertyPayload
                    });
                }
            } else {
                const createdProperty = await createPropertyMutation.mutateAsync(propertyPayload);
                propertyId = createdProperty.id;
            }

            if (initialLead) {
                await updateLeadMutation.mutateAsync({
                    ...initialLead,
                    zipCode: data.property.location.zipCode,
                });
            } else {
                if (!propertyId) {
                    toast.error("Property creation failed");
                    return;
                }
                const leadPayload: CreateLeadDto = {
                    userInfo: user.id,
                    propertyInfo: propertyId,
                    zipCode: data.property.location.zipCode,
                    status: 'NEW',
                    userId: user.id
                };
                createLeadMutation.mutate(leadPayload);
            }
        } catch (error) {
            console.error("Error in lead save flow:", error);
            toast.error(initialLead ? "Failed to update lead" : "Failed to create lead");
        }
    };

    const isPending = createLeadMutation.isPending || createPropertyMutation.isPending || updateLeadMutation.isPending || updatePropertyMutation.isPending;
    const wardOptions = selectedCity?.wards.map(w => ({
        value: w.name,
        label: w.name,
        sublabel: w.zipCode
    })) || [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {initialLead && (
                <>
                    <div className="flex items-center gap-3 pb-2 border-b border-border-main">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                            <FileText className="h-4 w-4"/>
                        </div>
                        <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Lead
                            Information</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Lead ID</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/>
                                <div
                                    className="h-10 w-full rounded-md border border-border-main bg-muted px-3 py-2 pl-9 text-sm text-text-muted flex items-center">
                                    {initialLead.id}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/>
                                <div
                                    className="h-10 w-full rounded-md border border-border-main bg-muted px-3 py-2 pl-9 text-sm text-text-muted flex items-center">
                                    <Badge variant="secondary"
                                           className="bg-primary/10 text-primary hover:bg-primary/20 pointer-events-none">
                                        {initialLead.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center gap-3 pb-2 border-b border-border-main">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <MapPin className="h-4 w-4"/>
                </div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Property Location</h4>
            </div>

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
                                className="bg-muted"
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
                        className="bg-muted border-border-main text-text-muted cursor-not-allowed"
                        {...register('property.location.zipCode')}
                    />
                    {errors.property?.location?.zipCode &&
                        <p className="text-red-500 text-xs">{errors.property.location.zipCode.message}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                    <Label>Street / House number</Label>
                    <div className="relative">
                        <Home className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/>
                        <Input
                            placeholder="e.g. Số 10, Ngõ 5"
                            {...register('property.location.street')}
                            className="pl-9 bg-muted border-border-main focus:bg-muted active:bg-muted"
                        />
                    </div>
                    {errors.property?.location?.street &&
                        <p className="text-red-500 text-xs">{errors.property.location.street.message}</p>}
                </div>

                <div className="col-span-2 pt-4 flex items-center gap-3 pb-2 border-b border-border-main">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                        <Building2 className="h-4 w-4"/>
                    </div>
                    <h4 className="text-sm font-medium uppercase tracking-wider text-text-secondary">Property
                        Attributes</h4>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="constructionType">Construction type</Label>
                    <div className="relative">
                        <Hammer className="absolute left-3 top-2.5 h-4 w-4 text-text-muted z-10 pointer-events-none"/>
                        <Controller
                            control={control}
                            name="property.attributes.constructionType"
                            render={({field}) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="pl-9 bg-muted border-border-main hover:bg-muted/80">
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
                    </div>
                    {errors.property?.attributes?.constructionType &&
                        <p className="text-red-500 text-xs">{errors.property.attributes.constructionType.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year built</Label>
                    <div className="relative">
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
                                    className="pl-9 bg-muted border-border-main"
                                />
                            )}
                        />
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                    </div>
                    {errors.property?.attributes?.yearBuilt &&
                        <p className="text-red-500 text-xs">{errors.property.attributes.yearBuilt.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="noFloors">No. floors</Label>
                    <div className="relative">
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
                                    className="pl-9 bg-muted border-border-main"
                                />
                            )}
                        />
                        <Layers className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                    </div>
                    {errors.property?.attributes?.noFloors &&
                        <p className="text-red-500 text-xs">{errors.property.attributes.noFloors.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="squareMeters">Square meters</Label>
                    <div className="relative">
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
                                    className="pl-9 bg-muted border-border-main"
                                />
                            )}
                        />
                        <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                    </div>
                    {errors.property?.attributes?.squareMeters &&
                        <p className="text-red-500 text-xs">{errors.property.attributes.squareMeters.message}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="estimatedConstructionCost">Est. cost</Label>
                    <div className="relative">
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
                                        format={formatNumber}
                                        parse={parseNumber}
                                        className="pl-9 bg-muted border-border-main pr-16"
                                    />
                                    <span
                                        className="absolute right-10 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none font-medium">₫</span>
                                    <Wallet
                                        className="absolute left-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none z-10"/>
                                </div>
                            )}
                        />
                    </div>
                    {errors.property?.valuation?.estimatedConstructionCost &&
                        <p className="text-red-500 text-xs">{errors.property.valuation.estimatedConstructionCost.message}</p>}
                </div>
            </div>

            <DialogFooter className="pt-4 flex !justify-between w-full sm:justify-between">
                {onDelete && initialLead ? (
                    <Button
                        type="button"
                        variant="destructive"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                ) : <div></div>}

                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit"
                            disabled={isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isPending ? 'Saving...' : (initialLead ? 'Update Lead' : 'Create Lead')}
                    </Button>
                </div>
            </DialogFooter>
        </form>
    );
};