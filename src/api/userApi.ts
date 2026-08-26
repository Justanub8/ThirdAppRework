import { IProfileUser } from "~/interfaces";
import axiosInstance from "~/services/axiosClient";

export interface GetAllUsersResponse {
    users: IProfileUser[];
    data?: IProfileUser[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const userApi = {
    getUser: (id: string) => 
        axiosInstance.get<{ user: IProfileUser }>(`/user/profile/${id}`),
    
    getMyProfile: () =>
        axiosInstance.get<{ user: IProfileUser }>(`/user/profile`),
    
    getAllUsers: (page: number = 1, limit: number = 20) =>
        axiosInstance.get<GetAllUsersResponse>(`/user/all?page=${page}&limit=${limit}`),

    updateProfile: (payload: Partial<IProfileUser>) =>
        axiosInstance.put<{ message: string; user: IProfileUser }>('/user/profile', payload),
};