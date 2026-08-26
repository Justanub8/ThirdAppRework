import axiosInstance from "~/services/axiosClient";
import { PaginatedResponse } from "./api";

export interface BookmarkPayload {
    targetId: string;
    targetType: 'Post' | 'Reel' | 'Story' | string;
}

export const bookmarkApi = {
    toggleBookmark: (payload: BookmarkPayload) =>
        axiosInstance.post<{ message: string; bookmark?: any }>('/bookmark/toggle', payload),
    
    createBookmark: (payload: BookmarkPayload) => 
        axiosInstance.post<{ message: string; bookmark?: any }>('/bookmark/create', payload),
    
    deleteBookmark: (payload: BookmarkPayload) =>
        axiosInstance.delete<{ message: string }>('/bookmark/delete', { data: payload }),
    
    getUserBookmarks: (page: number = 1, limit: number = 20, targetType?: string) => {
        const targetParam = targetType ? `&targetType=${targetType}` : '';
        return axiosInstance.get<PaginatedResponse<any>>(`/bookmark/all?page=${page}&limit=${limit}${targetParam}`);
    },
};