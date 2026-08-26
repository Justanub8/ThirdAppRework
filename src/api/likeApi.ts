import axiosInstance from "~/services/axiosClient";

export interface LikePayload {
    targetId: string;
    targetType: 'Post' | 'Reel' | 'Story' | 'Comment' | string;
}

export const likeApi = {
    toggleLike: (payload: LikePayload) =>
        axiosInstance.post<{ message: string; like?: any }>('/like/toggle', payload),
    
    createLike: (payload: LikePayload) => 
        axiosInstance.post<{ message: string; like?: any }>('/like/create', payload),
    
    deleteLike: (payload: LikePayload) =>
        axiosInstance.delete<{ message: string }>('/like/delete', { data: payload }),
    
    getLikesByTarget: (targetId: string, targetType: string) =>
        axiosInstance.get<{ total: number; data: any[] }>(`/like/target?targetId=${targetId}&targetType=${targetType}`),
    
    getLike: (likeId: string) =>
        axiosInstance.get<{ like: any }>(`/like/${likeId}`),
};