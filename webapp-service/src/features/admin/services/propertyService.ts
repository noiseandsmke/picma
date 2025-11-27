import axios from 'axios';

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
    fullAddress: string;
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
}

const PROPERTY_SERVICE_URL = import.meta.env.VITE_PROPERTY_SERVICE_URL || 'http://localhost:7101';
const propertyClient = axios.create({baseURL: PROPERTY_SERVICE_URL});

export const fetchAllProperties = async (): Promise<PropertyInfoDto[]> => {
    try {
        const response = await propertyClient.get<PropertyInfoDto[]>('/propertyInfo');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all properties", error);
        return [];
    }
};

export const createProperty = async (property: Omit<PropertyInfoDto, 'id'>): Promise<PropertyInfoDto> => {
    const response = await propertyClient.post<PropertyInfoDto>('/propertyInfo', property);
    return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
    await propertyClient.delete(`/propertyInfo/${id}`);
};

export const getPropertyByZipCode = async (zipCode: string): Promise<PropertyInfoDto[]> => {
    const response = await propertyClient.get<PropertyInfoDto[]>(`/propertyInfo/zipcode/${zipCode}`);
    return response.data;
};