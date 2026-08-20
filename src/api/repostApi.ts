import axiosInstance from "~/services/axiosClient";

export const repostApi = {
    createRepost: (payload: {targetId: string, targetType: string}) => 
        axiosInstance.post('/reposts/create', payload),
    deleteRepost: (payload: {targetId: string, targetType: string}) => 
        axiosInstance.delete('/reposts/delete', {data: payload}),
    getRepost: (repostId: string) =>
        axiosInstance.get(`/reposts/get/${repostId}`),
};