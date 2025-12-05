import apiClient from '@/services/apiClient';

export interface UserDto {
    id?: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    mobile?: string;
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

export const fetchUsers = async (role?: string, search?: string): Promise<UserDto[]> => {
    let endpoint = `${BASE_PATH}`;
    const params: Record<string, string> = {};

    if (role) {
        if (role.toLowerCase() === 'agent') endpoint = `${BASE_PATH}/agents`;
        else if (role.toLowerCase() === 'owner') endpoint = `${BASE_PATH}/owners`;
    }

    if (search) {
        params.search = search;
    }

    const response = await apiClient.get<UserDto[]>(endpoint, {params});
    return response.data;
};

export const fetchUserById = async (userId: string): Promise<UserDto | null> => {
    const response = await apiClient.get<UserDto>(`${BASE_PATH}/${userId}`);
    return response.data;
};

export const createUser = async (user: UserDto): Promise<UserDto> => {
    const response = await apiClient.post<UserDto>(`${BASE_PATH}`, user);
    return response.data;
};

export const switchUserGroup = async (userId: string): Promise<void> => {
    await apiClient.put(`${BASE_PATH}/convert-to-agent`, {userId});
};