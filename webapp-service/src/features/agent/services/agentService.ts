import apiClient from '@/services/apiClient';
import { PropertyQuoteDto } from "@/features/admin/services/quoteService";

export type LeadAction = 'INTERESTED' | 'ACCEPTED' | 'REJECTED' | null;


export interface AgentLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    zipCode: string;
    status: string;
    createDate: string;

    leadAction: string | null;
}

export interface BackendAgentLeadActionDto {
    id: number;
    leadAction: string | null;
    agentId: string;
    leadId: number;
    createdAt: string;
    propertyLead: {
        id: number;
        userInfo: string;
        propertyInfo: string;
        zipCode: string;
        status: string;
        createDate: string;

    } | null;
}

export interface AgentActionDto {
    id: number;
    leadAction: string;
    agentId: string;
    leadId: number;
    createDate: string;
}

const AGENT_BASE_PATH = '/picma/agents';
const QUOTE_BASE_PATH = '/picma/quotes';
const LEAD_BASE_PATH = '/picma/leads';

export interface PropertyLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    createDate: string;

    zipCode: string;
    assignedAgents?: string[];
    valuation?: number;
}


export const fetchAgentLeads = async (): Promise<AgentLeadDto[]> => {

    const response = await apiClient.get<BackendAgentLeadActionDto[]>(`${AGENT_BASE_PATH}/leads/zipcode`);

    return response.data.map(item => {
        if (!item.propertyLead) return null;
        return {

            ...item.propertyLead,
            leadAction: item.leadAction
        };
    }).filter((item): item is AgentLeadDto => item !== null);
};

export const fetchLeadsByZipcode = async (zipCode: string): Promise<AgentLeadDto[]> => {
    const response = await apiClient.get<PropertyLeadDto[]>(`${LEAD_BASE_PATH}/zipcode/${zipCode}`);
    return response.data.map(lead => ({
        ...lead,
        leadAction: null
    }));
};

export const fetchLeadById = async (id: number): Promise<AgentLeadDto> => {
    const response = await apiClient.get<PropertyLeadDto>(`${LEAD_BASE_PATH}/${id}`);
    return {
        ...response.data,
        leadAction: null
    };
};

export interface AgentLeadActionRequestDto {
    id: number;
    leadId: number;
    agentId: string;
    leadAction: LeadAction;
}

export const updateLeadAction = async (leadData: AgentLeadActionRequestDto): Promise<AgentLeadActionRequestDto> => {
    const response = await apiClient.put<AgentLeadActionRequestDto>(`${AGENT_BASE_PATH}`, leadData);
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

export const fetchAgentActions = async (agentId: string): Promise<AgentActionDto[]> => {
    const response = await apiClient.get<AgentActionDto[]>(`${AGENT_BASE_PATH}/leads/actions`, {
        params: { agentId }
    });
    return response.data;
};