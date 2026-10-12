import axiosInstance from '~/services/axiosClient';
import { IProfileUser, IFollow } from '~/interfaces';
import { PaginatedResponse } from '~/api/api';

export const followApi = {
  createFollow: (userId: string) =>
    axiosInstance.post<{ message: string; follow: IFollow }>('/follows', {
      followingId: userId,
    }),

  updateFollow: (userId: string) =>
    axiosInstance.put<{ message: string; follow: IFollow }>('/follows', {
      followingId: userId,
    }),

  deleteFollow: (userId: string) =>
    axiosInstance.delete<{ message: string }>('/follows', {
      data: { followingId: userId },
    }),

  toggleFollow: (userId: string) =>
    axiosInstance.post<{ message: string }>('/follows/toggle', {
      followingId: userId,
    }),

  getFollowers: (userId: string, page: number = 1, limit: number = 20) =>
    axiosInstance.get<PaginatedResponse<IProfileUser>>(
      `/follows/followers/${userId}?page=${page}&limit=${limit}`,
    ),

  getFollowing: (userId: string, page: number = 1, limit: number = 20) =>
    axiosInstance.get<PaginatedResponse<IProfileUser>>(
      `/follows/following/${userId}?page=${page}&limit=${limit}`,
    ),
};
