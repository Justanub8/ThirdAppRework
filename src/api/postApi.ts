import axiosInstance from '~/services/axiosClient';
import { IPost, IResponseGetPost } from '~/interfaces';
import { PaginatedResponse } from './api';

export interface CreatePostPayload {
    caption?: string;
    media: Array<{ url: string; type?: 'image' | 'video' } | string>;
}

export const postApi = {
    getAllPosts: (page: number = 1, limit: number = 10, userId?: string) => {
        const userParam = userId ? `&userId=${userId}` : '';
        return axiosInstance.get<PaginatedResponse<IPost>>(`/post/all?page=${page}&limit=${limit}${userParam}`);
    },
    
    getPost: (postId: string) => 
        axiosInstance.get<IResponseGetPost>(`/post/${postId}`),
    
    createPost: (payload: CreatePostPayload) => 
        axiosInstance.post<{ message: string; post: IPost }>('/post/create', payload),
    
    updatePost: (postId: string, payload: { caption?: string }) => 
        axiosInstance.put<{ message: string; post: IPost }>(`/post/${postId}`, payload),
    
    deletePost: (postId: string) => 
        axiosInstance.delete<{ message: string }>(`/post/${postId}`),
};