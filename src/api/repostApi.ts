import axiosInstance from "~/services/axiosClient";
import { PaginatedResponse } from "./api";

export interface RepostPayload {
    targetId: string;
    targetType: 'Post' | 'Reel' | string;
}

export const repostApi = {
    toggleRepost: (payload: RepostPayload) =>
        axiosInstance.post<{ message: string; repost?: any }>('/repost/toggle', payload),
    
    createRepost: (payload: RepostPayload) => 
        axiosInstance.post<{ message: string; repost?: any }>('/repost/create', payload),
    
    deleteRepost: (payload: RepostPayload) => 
        axiosInstance.delete<{ message: string }>('/repost/delete', { data: payload }),
    
    getUserReposts: (page: number = 1, limit: number = 20, targetType?: string) => {
        const targetParam = targetType ? `&targetType=${targetType}` : '';
        return axiosInstance.get<PaginatedResponse<any>>(`/repost/all?page=${page}&limit=${limit}${targetParam}`);
    },
};