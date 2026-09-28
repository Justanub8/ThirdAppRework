import axiosInstance from "~/services/axiosClient";
import { PaginatedResponse } from "./api";

export interface SharePayload {
    targetId: string;
    targetType: 'Post' | 'Reel' | 'Story' | string;
}

export const shareApi = {
    createShare: (payload: SharePayload) =>
        axiosInstance.post<{ message: string; share?: any }>('/share/create', payload),

    deleteShare: (payload: SharePayload) =>
        axiosInstance.delete<{ message: string }>('/share/delete', { data: payload }),

    getUserShares: (page: number = 1, limit: number = 20, targetType?: string, userId?: string) => {
        const targetParam = targetType ? `&targetType=${targetType}` : '';
        const userParam = userId ? `&userId=${userId}` : '';
        return axiosInstance.get<PaginatedResponse<any>>(`/share/all?page=${page}&limit=${limit}${targetParam}${userParam}`);
    },

    getUserSharesByUserId: (userId: string, page: number = 1, limit: number = 20, targetType?: string) => {
        const targetParam = targetType ? `&targetType=${targetType}` : '';
        return axiosInstance.get<PaginatedResponse<any>>(`/share/user/${userId}?page=${page}&limit=${limit}${targetParam}`);
    },
};
