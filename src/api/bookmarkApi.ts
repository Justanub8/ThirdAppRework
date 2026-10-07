import axiosInstance from "~/services/axiosClient";
import { PaginatedResponse } from "./api";
import { IBookmark, BookmarkPayload } from "~/interfaces";

export type { BookmarkPayload };

export const bookmarkApi = {
    toggleBookmark: (payload: BookmarkPayload) =>
        axiosInstance.post<{ message: string; bookmark?: IBookmark }>('/bookmark/toggle', payload),
    
    createBookmark: (payload: BookmarkPayload) => 
        axiosInstance.post<{ message: string; bookmark?: IBookmark }>('/bookmark/create', payload),
    
    deleteBookmark: (payload: BookmarkPayload) =>
        axiosInstance.delete<{ message: string }>('/bookmark/delete', { data: payload }),
    
    getUserBookmarks: (page: number = 1, limit: number = 20, targetType?: string) => {
        const targetParam = targetType ? `&targetType=${targetType}` : '';
        return axiosInstance.get<PaginatedResponse<IBookmark>>(`/bookmark/all?page=${page}&limit=${limit}${targetParam}`);
    },
};