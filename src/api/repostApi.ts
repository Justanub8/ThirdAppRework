import axiosInstance from "~/services/axiosClient";
import { PaginatedResponse } from "./api";
import { IRepost, RepostPayload } from "~/interfaces";

export type { RepostPayload };

export const repostApi = {
    toggleRepost: (payload: RepostPayload) =>
        axiosInstance.post<{ message: string; repost?: IRepost }>('/repost/toggle', payload),
    
    createRepost: (payload: RepostPayload) => 
        axiosInstance.post<{ message: string; repost?: IRepost }>('/repost/create', payload),
    
    deleteRepost: (payload: RepostPayload) => 
        axiosInstance.delete<{ message: string }>('/repost/delete', { data: payload }),
    
    getUserReposts: (page: number = 1, limit: number = 20, targetType?: string, userId?: string) => {
        const targetParam = targetType ? `&targetType=${targetType}` : '';
        const userParam = userId ? `&userId=${userId}` : '';
        return axiosInstance.get<PaginatedResponse<IRepost>>(`/repost/all?page=${page}&limit=${limit}${targetParam}${userParam}`);
    },
};