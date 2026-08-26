import axiosInstance from "~/services/axiosClient";
import { IProfileUser } from "~/interfaces";
import { PaginatedResponse } from "./api";

export const followApi = {
    createFollow: (userId: string) => 
        axiosInstance.post<{ message: string; follow: any }>('/follow/create', { followingId: userId }),
    
    deleteFollow: (userId: string) => 
        axiosInstance.delete<{ message: string }>('/follow/delete', { data: { followingId: userId } }),
    
    toggleFollow: (userId: string) =>
        axiosInstance.post<{ message: string }>('/follow/toggle', { followingId: userId }),
    
    getFollowers: (userId: string, page: number = 1, limit: number = 20) =>
        axiosInstance.get<PaginatedResponse<IProfileUser>>(`/follow/followers/${userId}?page=${page}&limit=${limit}`),
    
    getFollowing: (userId: string, page: number = 1, limit: number = 20) =>
        axiosInstance.get<PaginatedResponse<IProfileUser>>(`/follow/following/${userId}?page=${page}&limit=${limit}`),
};