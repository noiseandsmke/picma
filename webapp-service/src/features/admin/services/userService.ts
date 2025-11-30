import axios from 'axios';

export interface UserDto {
    id?: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    mobile: string;
    role?: string;
    status?: string;
    lastActive?: string;
    zipCode?: string;
    group?: string | null;
    emailVerified?: boolean;
    enabled?: boolean;
    totp?: boolean;
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
            else if (role.toLowerCase() === 'staff') endpoint = '/users/staff';
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
};

export const createUser = async (user: UserDto): Promise<UserDto> => {
    const response = await userClient.post<UserDto>('/users', user);
    return response.data;
};

export const updateUser = async (user: UserDto): Promise<UserDto> => {
    const response = await userClient.put<UserDto>('/users/profile', user);
    return response.data;
};

export const updateUserStatus = async (userId: string, enabled: boolean): Promise<void> => {
    await userClient.put(`/users/${userId}/status`, null, {
        params: {enabled}
    });
};

export const switchUserGroup = async (userId: string, targetGroup: 'agents' | 'owners'): Promise<void> => {
    await userClient.put(`/users/${userId}/switch-group`, null, {
        params: {targetGroup}
    });
};