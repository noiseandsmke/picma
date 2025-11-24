import axios from 'axios';

export interface PropertyLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    startDate: string;
    expiryDate: string;
    assignedAgents?: string[];
}

export interface LeadStatsDto {
    totalLeads: number;
    acceptedLeads: number;
    rejectedLeads: number;
    overdueLeads: number;
}

const LEAD_SERVICE_URL = import.meta.env.VITE_LEAD_SERVICE_URL || 'http://localhost:7103/property-lead';

export const fetchAllLeads = async (): Promise<PropertyLeadDto[]> => {
    const response = await axios.get<PropertyLeadDto[]>(`${LEAD_SERVICE_URL}/all`);
    return response.data;
};

export const fetchLeadStats = async (): Promise<LeadStatsDto> => {
    const response = await axios.get<LeadStatsDto>(`${LEAD_SERVICE_URL}/stats`);
    return response.data;
};