import { IReel } from '~/interfaces/reel';
import { PaginatedResponse } from '~/api/api';
import axiosInstance from '~/services/axiosClient';

export interface CreateReelPayload {
  caption?: string;
  mediaId?: string;
  videoUrl?: string;
}

export const reelApi = {
  getAllReels: (page: number = 1, limit: number = 10, userId?: string) => {
    const userParam = userId ? `&userId=${userId}` : '';
    return axiosInstance.get<PaginatedResponse<IReel> & { reels: IReel[] }>(
      `/reels?page=${page}&limit=${limit}${userParam}`,
    );
  },

  getReel: (reelId: string) =>
    axiosInstance.get<{ reel: IReel }>(`/reels/${reelId}`),

  createReel: (payload: CreateReelPayload) =>
    axiosInstance.post<{ message: string; reel: IReel }>('/reels', payload),

  updateReel: (
    reelId: string,
    payload: { caption?: string; mediaId?: string },
  ) =>
    axiosInstance.put<{ message: string; reel: IReel }>(
      `/reels/${reelId}`,
      payload,
    ),

  deleteReel: (reelId: string) =>
    axiosInstance.delete<{ message: string }>(`/reels/${reelId}`),
};
