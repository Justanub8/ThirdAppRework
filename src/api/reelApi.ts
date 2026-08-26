import { IReel } from "~/interfaces/reel";
import { PaginatedResponse } from "./api";
import axiosInstance from "~/services/axiosClient";

export interface CreateReelPayload {
    caption: string;
    mediaId?: string;
    videoUrl?: string;
}

export const reelApi = {
    getAllReels: (page: number = 1, limit: number = 10, userId?: string) => {
        const userParam = userId ? `&userId=${userId}` : '';
        return axiosInstance.get<PaginatedResponse<IReel> & { reels: IReel[] }>(`/reel/all?page=${page}&limit=${limit}${userParam}`);
    },
    
    getReel: (reelId: string) => 
        axiosInstance.get<{ reel: IReel }>(`/reel/${reelId}`),
    
    createReel: (payload: CreateReelPayload) => 
        axiosInstance.post<{ message: string; reel: IReel }>('/reel/create', payload),
    
    updateReel: (reelId: string, payload: { caption?: string; mediaId?: string }) => 
        axiosInstance.put<{ message: string; reel: IReel }>(`/reel/${reelId}`, payload),
    
    deleteReel: (reelId: string) => 
        axiosInstance.delete<{ message: string }>(`/reel/${reelId}`),
};
