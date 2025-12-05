import apiClient from '@/services/apiClient';
import {PropertyQuoteDto} from "@/features/admin/services/quoteService";

export interface AgentLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    createdAt: string;
    agentId: string;
}

const AGENT_BASE_PATH = '/picma/agents';
const QUOTE_BASE_PATH = '/picma/quotes';

export const fetchAgentLeads = async (agentId: string): Promise<AgentLeadDto[]> => {
    const response = await apiClient.get<AgentLeadDto[]>(`${AGENT_BASE_PATH}/agent/leads`, {
        params: {agentId}
    });
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