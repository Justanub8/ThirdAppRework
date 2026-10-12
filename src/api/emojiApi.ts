import axiosInstance from '~/services/axiosClient';
import { PaginatedResponse, BaseResponse } from '~/api/api';
import {
  IEmoji,
  CreateEmojiPayload,
  DeleteEmojiPayload,
  GetEmojiQuery,
} from '~/interfaces';

export type { CreateEmojiPayload, DeleteEmojiPayload, GetEmojiQuery };

export const emojiApi = {
  createEmoji: (payload: CreateEmojiPayload) =>
    axiosInstance.post<BaseResponse<IEmoji>>('/emojis', payload),

  reactMessage: (payload: CreateEmojiPayload) =>
    axiosInstance.post<BaseResponse<IEmoji>>('/emojis', payload),

  deleteEmoji: (payload: DeleteEmojiPayload) =>
    axiosInstance.delete<BaseResponse<IEmoji>>('/emojis', { data: payload }),

  getEmojisByMessage: (
    messageId: string,
    page: number = 1,
    limit: number = 20,
  ) =>
    axiosInstance.get<PaginatedResponse<IEmoji>>(
      `/emojis/${messageId}?page=${page}&limit=${limit}&messageId=${messageId}`,
    ),

  getEmojis: ({ messageId, page = 1, limit = 20 }: GetEmojiQuery) =>
    axiosInstance.get<PaginatedResponse<IEmoji>>(
      `/emojis/${messageId}?page=${page}&limit=${limit}&messageId=${messageId}`,
    ),
};
