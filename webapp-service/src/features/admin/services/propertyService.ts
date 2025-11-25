import axios from 'axios';

export interface PropertyInfoDto {
    id: number;
    address: string;
    city: string;
    zipCode: string;
    type: string;
    ownerName?: string;
    ownerId?: string;
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