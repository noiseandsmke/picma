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
    zipcode?: string;
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
        let endpoint = '/user';
        if (role) {
            if (role.toLowerCase() === 'agent') endpoint = '/user/agents';
            else if (role.toLowerCase() === 'owner') endpoint = '/user/owners';
            else if (role.toLowerCase() === 'broker') endpoint = '/user/brokers';
            else if (role.toLowerCase() === 'staff') endpoint = '/user/staff';
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
        const response = await userClient.get<UserDto>(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch user ${userId}`, error);
        return null;
    }
};

export const createUser = async (user: UserDto): Promise<UserDto> => {
    const response = await userClient.post<UserDto>('/user', user);
    return response.data;
};

export const updateUser = async (user: UserDto): Promise<UserDto> => {
    const response = await userClient.put<UserDto>('/user/profile', user);
    return response.data;
};

export const updateUserStatus = async (userId: string): Promise<void> => {
    await userClient.put('/user/status', {userId});
};

export const switchUserGroup = async (userId: string): Promise<void> => {
    await userClient.post('/user/switch-group', {userId});
};