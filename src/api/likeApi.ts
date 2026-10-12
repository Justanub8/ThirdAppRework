import axiosInstance from '~/services/axiosClient';
import { ILike, LikePayload, IResponseGetLikes } from '~/interfaces';

export type { LikePayload };

export const likeApi = {
  toggleLike: (payload: LikePayload) =>
    axiosInstance.post<{ message: string; like?: ILike }>(
      '/likes/toggle',
      payload,
    ),

  createLike: (payload: LikePayload) =>
    axiosInstance.post<{ message: string; like?: ILike }>('/likes', payload),

  deleteLike: (payload: LikePayload) =>
    axiosInstance.delete<{ message: string }>('/likes', { data: payload }),

  getLikesByTarget: (targetId: string, targetType: string) =>
    axiosInstance.get<IResponseGetLikes>(
      `/likes/target?targetId=${targetId}&targetType=${targetType}`,
    ),

  getLike: (likeId: string) =>
    axiosInstance.get<{ like: ILike }>(`/likes/${likeId}`),
};
