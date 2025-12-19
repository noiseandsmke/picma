import apiClient from '@/services/apiClient';

export interface LeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: 'NEW' | 'IN_REVIEW';
    createDate: string;

    assignedAgents?: string[];
    valuation?: number;
    zipCode?: string;
}

export interface PropertyLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: 'NEW' | 'IN_REVIEW';
    createDate: string;

    zipCode: string;
    assignedAgents?: string[];
    valuation?: number;
}

export interface CreateLeadDto {
    userInfo: string;
    propertyInfo: string;
    zipCode: string;
    status: 'NEW' | 'IN_REVIEW';
    userId?: string;
}

export interface LeadStatsDto {
    totalLeads: number;
    newLeads: number;
    inReviewLeads: number;
    acceptedLeads: number;
}

export interface LeadTrendData {
    date: string;
    count: number;
}

const LEAD_SERVICE_URL = '/picma/leads';

export const fetchAllLeads = async (sortBy = 'id', sortDirection = 'asc', status?: string): Promise<PropertyLeadDto[]> => {
    const response = await apiClient.get<PropertyLeadDto[]>(`${LEAD_SERVICE_URL}`, {
        params: { sortBy, sortDirection, status },
    });
    return response.data;
};

export const fetchLeadById = async (id: number): Promise<PropertyLeadDto> => {
    const response = await apiClient.get<PropertyLeadDto>(`${LEAD_SERVICE_URL}/${id}`);
    return response.data;
};

export const fetchLeadStats = async (): Promise<LeadStatsDto> => {
    const response = await apiClient.get<LeadStatsDto>(`${LEAD_SERVICE_URL}/stats`);
    return response.data;
};

export const fetchLeadTrend = async (): Promise<LeadTrendData[]> => {
    const response = await apiClient.get<LeadTrendData[]>(`${LEAD_SERVICE_URL}/stats/trend`);
    return response.data;
};

export const createLead = async (leadData: CreateLeadDto): Promise<PropertyLeadDto> => {
    const response = await apiClient.post<PropertyLeadDto>(`${LEAD_SERVICE_URL}`, leadData);
    return response.data;
};

export const updateLead = async (leadData: PropertyLeadDto): Promise<PropertyLeadDto> => {
    const response = await apiClient.put<PropertyLeadDto>(`${LEAD_SERVICE_URL}/${leadData.id}`, leadData);
    return response.data;
};

export const deleteLead = async (leadId: number): Promise<void> => {
    await apiClient.delete(`${LEAD_SERVICE_URL}/${leadId}`);
};