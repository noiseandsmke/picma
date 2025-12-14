import apiClient from '@/services/apiClient';
import { PropertyQuoteDto } from "@/features/admin/services/quoteService";

export type LeadAction = 'INTERESTED' | 'ACCEPTED' | 'REJECTED' | null;

export interface AgentLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    leadAction: LeadAction;
    createdAt: string;
    agentId: string;
    leadId: number;
}

const AGENT_BASE_PATH = '/picma/agents';
const QUOTE_BASE_PATH = '/picma/quotes';

export const fetchAgentLeads = async (agentId: string): Promise<AgentLeadDto[]> => {
    const response = await apiClient.get<AgentLeadDto[]>(`${AGENT_BASE_PATH}/agent/leads`, {
        params: { agentId }
    });
    return response.data;
};

export const updateLeadAction = async (leadData: Partial<AgentLeadDto>): Promise<AgentLeadDto> => {
    const response = await apiClient.put<AgentLeadDto>(`${AGENT_BASE_PATH}/agent`, leadData);
    return response.data;
};

export const fetchAgentQuotes = async (agentId: string): Promise<PropertyQuoteDto[]> => {
    const response = await apiClient.get<PropertyQuoteDto[]>(`${QUOTE_BASE_PATH}/agent/${agentId}`);
    return response.data;
};

export const fetchAgentsByZip = async (zipCode: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`${AGENT_BASE_PATH}/agents/zipcode/${zipCode}`);
    return response.data;
};

export const updateAgentProfile = async (data: any): Promise<any> => {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
};