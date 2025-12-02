import apiClient from '@/services/apiClient';

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

const BASE_PATH = '/picma/users';

export const fetchUsers = async (role?: string): Promise<UserDto[]> => {
    try {
        let endpoint = `${BASE_PATH}/user`;
        if (role) {
            if (role.toLowerCase() === 'agent') endpoint = `${BASE_PATH}/user/agents`;
            else if (role.toLowerCase() === 'owner') endpoint = `${BASE_PATH}/user/owners`;
            else if (role.toLowerCase() === 'broker') endpoint = `${BASE_PATH}/user/brokers`;
            else if (role.toLowerCase() === 'staff') endpoint = `${BASE_PATH}/user/staff`;
        }

        const response = await apiClient.get<UserDto[]>(endpoint);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch users", error);
        return [];
    }
};

export const fetchUserById = async (userId: string): Promise<UserDto | null> => {
    try {
        const response = await apiClient.get<UserDto>(`${BASE_PATH}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch user ${userId}`, error);
        return null;
    }
};

export const createUser = async (user: UserDto): Promise<UserDto> => {
    const response = await apiClient.post<UserDto>(`${BASE_PATH}/user`, user);
    return response.data;
};

export const updateUser = async (user: UserDto): Promise<UserDto> => {
    const response = await apiClient.put<UserDto>(`${BASE_PATH}/user/profile`, user);
    return response.data;
};

export const updateUserStatus = async (userId: string): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/user/status`, {userId});
};

export const switchUserGroup = async (userId: string): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/user/switch-group`, {userId});
};