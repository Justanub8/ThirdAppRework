import axiosInstance from '~/services/axiosClient';

export const commentApi = {
    getCommentsByTarget: (targetId: string, page: number = 1, limit: number = 20) => 
        axiosInstance.get(`/comments/target/${targetId}?page=${page}&limit=${limit}`),
    getReplies: (parentId: string, page: number = 1, limit: number = 20) => 
        axiosInstance.get(`/comments/replies/${parentId}?page=${page}&limit=${limit}`),
    createComment: (payload: {targetId: string, targetType: string, content: string, parentId?: string}) => 
        axiosInstance.post(`/comments/create`, payload)
};
