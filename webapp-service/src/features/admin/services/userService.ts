import axios from 'axios';

export interface UserDto {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    lastActive?: string;
    firstName?: string;
    lastName?: string;
    zipCode?: string;
}

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5051';

const userClient = axios.create({
    baseURL: USER_SERVICE_URL,
});

userClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchUsers = async (role?: string): Promise<UserDto[]> => {
    try {
        let endpoint = '/users';
        if (role) {
            if (role.toLowerCase() === 'agent') endpoint = '/users/agents';
            else if (role.toLowerCase() === 'owner') endpoint = '/users/owners';
            else if (role.toLowerCase() === 'broker') endpoint = '/users/brokers';
        }

        const response = await userClient.get<UserDto[]>(endpoint);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users", error);
        return [];
    }
};

export const fetchUserById = async (userId: string): Promise<UserDto | null> => {
    try {
        const response = await userClient.get<UserDto>(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch user ${userId}`, error);
        return null;
    }
}