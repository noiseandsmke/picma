import axios from 'axios';

export interface PropertyLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    createDate: string;
    expiryDate: string;
    assignedAgents?: string[];
    valuation?: number; // Added based on requirement for "Use Lead Valuation"
}

export interface CreateLeadDto {
    userInfo: string;
    propertyInfo: string;
    status: string;
}

export interface LeadStatsDto {
    totalLeads: number;
    acceptedLeads: number;
    rejectedLeads: number;
    overdueLeads: number;
}

export interface LeadTrendData {
    date: string;
    count: number;
}

const LEAD_SERVICE_URL = import.meta.env.VITE_LEAD_SERVICE_URL || 'http://localhost:7103/property-lead';

export const fetchAllLeads = async (sort = 'id', order = 'asc'): Promise<PropertyLeadDto[]> => {
    const response = await axios.get<PropertyLeadDto[]>(`${LEAD_SERVICE_URL}/all`, {
        params: {sort, order},
    });
    return response.data;
};

export const fetchLeadById = async (id: number): Promise<PropertyLeadDto> => {
    const response = await axios.get<PropertyLeadDto>(`${LEAD_SERVICE_URL}/${id}`);
    return response.data;
};

export const fetchLeadStats = async (): Promise<LeadStatsDto> => {
    const response = await axios.get<LeadStatsDto>(`${LEAD_SERVICE_URL}/stats`);
    return response.data;
};

export const fetchLeadTrend = async (): Promise<LeadTrendData[]> => {
    const response = await axios.get<LeadTrendData[]>(`${LEAD_SERVICE_URL}/trend`);
    return response.data;
};

export const createLead = async (leadData: CreateLeadDto): Promise<PropertyLeadDto> => {
    const response = await axios.post<PropertyLeadDto>(`${LEAD_SERVICE_URL}`, leadData);
    return response.data;
}

export const updateLead = async (leadData: PropertyLeadDto): Promise<PropertyLeadDto> => {
    const response = await axios.put<PropertyLeadDto>(`${LEAD_SERVICE_URL}/${leadData.id}`, leadData);
    return response.data;
}

export const deleteLead = async (leadId: number): Promise<void> => {
    await axios.delete(`${LEAD_SERVICE_URL}/${leadId}`);
}