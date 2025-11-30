import axios from 'axios';
import {fetchUserById} from '../../admin/services/userService';

export interface PropertyDto {
    id: number;
    address: string;
    city: string;
    zipCode: string;
    type: string;
    imageUrl?: string;
    isInsured: boolean;
    lastAssessmentDate?: string;
}

export interface AgentDto {
    id: string;
    name: string;
    firm?: string;
    rating?: number;
    zipCode: string;
    phone?: string;
}

const PROPERTY_SERVICE_URL = import.meta.env.VITE_PROPERTY_SERVICE_URL || 'http://localhost:7101';
const AGENT_SERVICE_URL = import.meta.env.VITE_AGENT_SERVICE_URL || 'http://localhost:7104';

const propertyClient = axios.create({baseURL: PROPERTY_SERVICE_URL});
const agentClient = axios.create({baseURL: AGENT_SERVICE_URL});

export const fetchOwnerProperties = async (ownerId: string): Promise<PropertyDto[]> => {
    console.log(`Fetching properties for owner context: ${ownerId}`);
    try {
        const response = await propertyClient.get<PropertyDto[]>('/propertyInfo');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch properties", error);
        return [];
    }
};

export const fetchAgentsForDirectory = async (zipCode: string): Promise<AgentDto[]> => {
    try {
        const idsResponse = await agentClient.get<string[]>(`/agents/zipcode/${zipCode}`);
        const agentIds = idsResponse.data;

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
                    rating: 5.0,
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