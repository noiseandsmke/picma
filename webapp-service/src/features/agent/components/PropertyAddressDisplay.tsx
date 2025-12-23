import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchPropertyById} from '@/features/admin/services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';

interface PropertyAddressDisplayProps {
    propertyId: string;
    className?: string;
}

export const PropertyAddressDisplay: React.FC<PropertyAddressDisplayProps> = ({propertyId, className}) => {
    const {data: property, isLoading, isError} = useQuery({
        queryKey: ['property', propertyId],
        queryFn: () => fetchPropertyById(propertyId),
        enabled: !!propertyId && !propertyId.includes(' ')
    });

    if (isLoading) {
        return <Skeleton className="h-5 w-3/4 max-w-[200px] bg-muted"/>;
    }

    if (isError || !property) {

        return <span className={className}
                     title={propertyId}>Address unavailable ({propertyId.substring(0, 8)}...)</span>;
    }

    const address = property.location
        ? `${property.location.street}, ${property.location.ward}, ${property.location.city}`
        : 'Address data missing';

    return <span className={className} title={address}>{address}</span>;
};