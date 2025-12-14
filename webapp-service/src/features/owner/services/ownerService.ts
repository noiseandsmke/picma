import apiClient from '@/services/apiClient';
import { fetchUserById } from '../../admin/services/userService';
import { PropertyInfoDto } from "@/features/admin/services/propertyService";

export interface AgentDto {
    id: string;
    name: string;
    firm?: string;
    rating?: number;
    zipCode: string;
    phone?: string;
}

const PROPERTY_BASE_PATH = '/picma/properties';
const AGENT_BASE_PATH = '/picma/agents';
const LEAD_BASE_PATH = '/picma/leads';

export const updateOwnerLead = async (leadId: number, leadData: object): Promise<object> => {
    const response = await apiClient.put(`${LEAD_BASE_PATH}/${leadId}/details`, leadData);
    return response.data;
};

export const fetchOwnerProperties = async (ownerId: string): Promise<PropertyInfoDto[]> => {

    try {
        const response = await apiClient.get<PropertyInfoDto[]>(`${PROPERTY_BASE_PATH}/user/${ownerId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch properties", error);
        return [];
    }
};

export const fetchAgentsForDirectory = async (zipCode: string): Promise<AgentDto[]> => {
    try {
        const response = await apiClient.get<string[]>(`${AGENT_BASE_PATH}/agents/zipcode/${zipCode}`);
        const agentIds = response.data;

        if (!agentIds || agentIds.length === 0) {
            return [];
        }

        const agentPromises = agentIds.map(async (id) => {
            const user = await fetchUserById(id);
            if (user) {
                return {
                    id: user.id,
                    name: `${user.firstName || ''} ${user.lastName || user.username}`.trim(),
                    firm: "Local Insurance Co.",
                    rating: 5,
                    zipCode: user.zipcode || zipCode,
                    phone: "555-0123"
                } as AgentDto;
            }
            return null;
        });

        const agents = await Promise.all(agentPromises);
        return agents.filter((a): a is AgentDto => a !== null);

    } catch (error) {
        console.error("Failed to fetch agents directory", error);
        return [];
    }
};