import axiosInstance from '~/services/axiosClient';
import { IPost, IResponseGetPost } from '~/interfaces';
import { PaginatedResponse } from '~/api/api';

export interface CreatePostPayload {
  caption?: string;
  media: Array<{ url: string; type?: 'image' | 'video' } | string>;
}

export const postApi = {
  getAllPosts: (page: number = 1, limit: number = 10, userId?: string) => {
    const userParam = userId ? `&userId=${userId}` : '';
    return axiosInstance.get<PaginatedResponse<IPost>>(
      `/posts?page=${page}&limit=${limit}${userParam}`,
    );
  },

  getPost: (postId: string) =>
    axiosInstance.get<IResponseGetPost>(`/posts/${postId}`),

  createPost: (payload: CreatePostPayload) =>
    axiosInstance.post<{ message: string; post: IPost }>('/posts', payload),

  updatePost: (postId: string, payload: { caption?: string }) =>
    axiosInstance.put<{ message: string; post: IPost }>(
      `/posts/${postId}`,
      payload,
    ),

  deletePost: (postId: string) =>
    axiosInstance.delete<{ message: string }>(`/posts/${postId}`),
};
