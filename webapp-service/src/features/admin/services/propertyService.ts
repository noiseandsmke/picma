import apiClient from '@/services/apiClient';

export type ConstructionType =
    | 'CONCRETE'
    | 'STEEL_FRAME'
    | 'MASONRY'
    | 'WOOD_FRAME';

export type OccupancyType =
    | 'RESIDENTIAL'
    | 'COMMERCIAL'
    | 'INDUSTRIAL'
    | 'MIXED_USE';

export interface PropertyLocationDto {
    street: string;
    ward: string;
    city: string;
    zipCode: string;
}

export interface PropertyAttributesDto {
    constructionType: ConstructionType;
    occupancyType: OccupancyType;
    yearBuilt: number;
    noFloors: number;
    squareMeters: number;
}

export interface PropertyValuationDto {
    estimatedConstructionCost: number;
}

export interface PropertyInfoDto {
    id: string;
    location: PropertyLocationDto;
    attributes: PropertyAttributesDto;
    valuation: PropertyValuationDto;
    userId?: string;
}

const BASE_PATH = '/picma/properties';

export const fetchAllProperties = async (): Promise<PropertyInfoDto[]> => {
    try {
        const response = await apiClient.get<PropertyInfoDto[]>(`${BASE_PATH}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all properties", error);
        return [];
    }
};

export const fetchPropertyById = async (id: string): Promise<PropertyInfoDto> => {
    const response = await apiClient.get<PropertyInfoDto>(`${BASE_PATH}/${id}`);
    return response.data;
};

export const createProperty = async (property: Omit<PropertyInfoDto, 'id'>): Promise<PropertyInfoDto> => {
    const response = await apiClient.post<PropertyInfoDto>(`${BASE_PATH}`, property);
    return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`${BASE_PATH}/${id}`);
    return response.data;
};