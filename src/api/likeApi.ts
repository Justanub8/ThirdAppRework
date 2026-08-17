import axiosInstance from "~/services/axiosClient";

export const likeApi = {
    createLike: (payload: {targetId: string, targetType: string}) => 
        axiosInstance.post(`/likes/create`, payload),
    deleteLike: (payload: {targetId: string, targetType: string}) =>
        axiosInstance.delete(`/likes/delete`, { data: payload })
}