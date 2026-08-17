import axiosInstance from '~/services/axiosClient';
import { IResponseGetPost } from '~/interfaces';

export const postApi = {
    getPost: (postId: string) => axiosInstance.get<IResponseGetPost>(`posts/get/${postId}`),
    getAllPosts: (page: number = 1, limit: number = 10) => axiosInstance.get(`/posts/all?page=${page}&limit=${limit}`)
}