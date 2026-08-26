import axiosInstance from '~/services/axiosClient';
import { IComment } from '~/interfaces';
import { PaginatedResponse } from './api';

export interface CreateCommentPayload {
    targetId: string;
    targetType: 'Post' | 'Reel' | 'Story' | 'Comment' | string;
    content: string;
    parentId?: string;
}

export const commentApi = {
    getCommentsByTarget: (targetId: string, page: number = 1, limit: number = 20) => 
        axiosInstance.get<PaginatedResponse<IComment>>(`/comment/target/${targetId}?page=${page}&limit=${limit}`),
    
    getReplies: (parentId: string, page: number = 1, limit: number = 20) => 
        axiosInstance.get<PaginatedResponse<IComment>>(`/comment/replies/${parentId}?page=${page}&limit=${limit}`),
    
    createComment: (payload: CreateCommentPayload) => 
        axiosInstance.post<{ message: string; data: IComment; comment: IComment }>(`/comment/create`, payload),
    
    getComment: (commentId: string) =>
        axiosInstance.get<{ comment: IComment }>(`/comment/${commentId}`),
    
    updateComment: (commentId: string, content: string) =>
        axiosInstance.put<{ message: string; comment: IComment }>(`/comment/${commentId}`, { content }),
    
    deleteComment: (commentId: string) =>
        axiosInstance.delete<{ message: string }>(`/comment/${commentId}`),
};
