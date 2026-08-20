import axiosInstance from "~/services/axiosClient";

export const bookmarkApi = {
    createBookmark: (payload: {targetId: string, targetType: string}) => 
        axiosInstance.post('/bookmarks/create', payload),
    deleteBookmark: (payload: {targetId: string, targetType: string}) =>
        axiosInstance.delete('/bookmarks/delete', { data: payload }),
    getBookmark: (bookmarkId: string) =>
        axiosInstance.get(`/bookmarks/get/${bookmarkId}`),
};