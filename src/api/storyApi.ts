import axiosInstance from '~/services/axiosClient';
import { IStory, IResponseGetStory } from '~/interfaces';
import { PaginatedResponse } from '~/api/api';

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
    return axiosInstance.get<PaginatedResponse<IStory> & { stories: IStory[] }>(
      `/stories?page=${page}&limit=${limit}${userParam}`,
    );
  },

  getStory: (storyId: string) =>
    axiosInstance.get<IResponseGetStory>(`/stories/${storyId}`),

  createStory: (payload: CreateStoryPayload) =>
    axiosInstance.post<{ message: string; story: IStory }>('/stories', payload),

  deleteStory: (storyId: string) =>
    axiosInstance.delete<{ message: string }>(`/stories/${storyId}`),

  viewStory: (storyId: string) =>
    axiosInstance.post<{ message: string; story: IStory }>(
      `/stories/${storyId}/views`,
    ),
};
