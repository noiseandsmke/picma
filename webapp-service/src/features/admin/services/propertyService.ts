import apiClient from '@/services/apiClient';

export enum ConstructionType {
    CONCRETE = 'CONCRETE',
    STEEL_FRAME = 'STEEL_FRAME',
    MASONRY = 'MASONRY',
    WOOD_FRAME = 'WOOD_FRAME'
}

export enum OccupancyType {
    RESIDENTIAL = 'RESIDENTIAL',
    COMMERCIAL = 'COMMERCIAL',
    INDUSTRIAL = 'INDUSTRIAL',
    MIXED_USE = 'MIXED_USE'
}

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
        const response = await apiClient.get<PropertyInfoDto[]>(`${BASE_PATH}/propertyInfo`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all properties", error);
        return [];
    }
};

export const fetchPropertyById = async (id: string): Promise<PropertyInfoDto> => {
    const response = await apiClient.get<PropertyInfoDto>(`${BASE_PATH}/propertyInfo/${id}`);
    return response.data;
};

export const createProperty = async (property: Omit<PropertyInfoDto, 'id'>): Promise<PropertyInfoDto> => {
    const response = await apiClient.post<PropertyInfoDto>(`${BASE_PATH}/propertyInfo`, property);
    return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/propertyInfo/${id}`);
};

export const getPropertyByZipCode = async (zipCode: string): Promise<PropertyInfoDto[]> => {
    const response = await apiClient.get<PropertyInfoDto[]>(`${BASE_PATH}/propertyInfo/zipcode/${zipCode}`);
    return response.data;
};