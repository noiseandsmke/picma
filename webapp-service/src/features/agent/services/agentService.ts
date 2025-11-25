import axios from 'axios';

export interface AgentLeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    createdAt: string;
    agentId: string;
}

const AGENT_SERVICE_URL = import.meta.env.VITE_AGENT_SERVICE_URL || 'http://localhost:7104';

export const fetchAgentLeads = async (agentId: string): Promise<AgentLeadDto[]> => {
    const response = await axios.get<AgentLeadDto[]>(`${AGENT_SERVICE_URL}/agent/leads`, {
        params: {agentId}
    });
    return response.data;
};

export const fetchAgentsByZip = async (zipCode: string): Promise<string[]> => {
    const response = await axios.get<string[]>(`${AGENT_SERVICE_URL}/agents/zipcode/${zipCode}`);
    return response.data;
};