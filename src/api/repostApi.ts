import axiosInstance from '~/services/axiosClient';
import { PaginatedResponse } from '~/api/api';
import { IRepost, RepostPayload } from '~/interfaces';

export type { RepostPayload };

export const repostApi = {
  toggleRepost: (payload: RepostPayload) =>
    axiosInstance.post<{ message: string; repost?: IRepost }>(
      '/reposts/toggle',
      payload,
    ),

  createRepost: (payload: RepostPayload) =>
    axiosInstance.post<{ message: string; repost?: IRepost }>(
      '/reposts',
      payload,
    ),

  deleteRepost: (payload: RepostPayload) =>
    axiosInstance.delete<{ message: string }>('/reposts', { data: payload }),

  getUserReposts: (
    page: number = 1,
    limit: number = 20,
    targetType?: string,
    userId?: string,
  ) => {
    const targetParam = targetType ? `&targetType=${targetType}` : '';
    const userParam = userId ? `&userId=${userId}` : '';
    return axiosInstance.get<PaginatedResponse<IRepost>>(
      `/reposts?page=${page}&limit=${limit}${targetParam}${userParam}`,
    );
  },
};
