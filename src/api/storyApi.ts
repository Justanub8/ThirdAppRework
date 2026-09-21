import axiosInstance from '~/services/axiosClient';
import { IStory, IResponseGetStory } from '~/interfaces';
import { PaginatedResponse } from './api';

export interface CreateStoryPayload {
    content?: string;
    mediaId?: string;
    mediaUrl?: string;
    type?: string;
    expiredAt?: string;
}

export const storyApi = {
    getAllStories: (page: number = 1, limit: number = 20, userId?: string) => {
        const userParam = userId ? `&userId=${userId}` : '';
        return axiosInstance.get<PaginatedResponse<IStory> & { stories: IStory[] }>(`/story/all?page=${page}&limit=${limit}${userParam}`);
    },
    
    getStory: (storyId: string) => 
        axiosInstance.get<IResponseGetStory>(`/story/${storyId}`),
    
    createStory: (payload: CreateStoryPayload) => 
        axiosInstance.post<{ message: string; story: IStory }>('/story/create', payload),
    
    deleteStory: (storyId: string) => 
        axiosInstance.delete<{ message: string }>(`/story/${storyId}`),
    
    viewStory: (storyId: string) =>
        axiosInstance.post<{ message: string; story: IStory }>(`/story/${storyId}/view`),
};
