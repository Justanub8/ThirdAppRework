import axiosInstance from "~/services/axiosClient";
import { ILike, LikePayload, IResponseGetLikes } from "~/interfaces";

export type { LikePayload };

export const likeApi = {
    toggleLike: (payload: LikePayload) =>
        axiosInstance.post<{ message: string; like?: ILike }>('/like/toggle', payload),
    
    createLike: (payload: LikePayload) => 
        axiosInstance.post<{ message: string; like?: ILike }>('/like/create', payload),
    
    deleteLike: (payload: LikePayload) =>
        axiosInstance.delete<{ message: string }>('/like/delete', { data: payload }),
    
    getLikesByTarget: (targetId: string, targetType: string) =>
        axiosInstance.get<IResponseGetLikes>(`/like/target?targetId=${targetId}&targetType=${targetType}`),
    
    getLike: (likeId: string) =>
        axiosInstance.get<{ like: ILike }>(`/like/${likeId}`),
};