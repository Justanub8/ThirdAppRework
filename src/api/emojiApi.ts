import axiosInstance from "~/services/axiosClient";
import { PaginatedResponse, BaseResponse } from "./api";
import { IEmoji, CreateEmojiPayload, DeleteEmojiPayload, GetEmojiQuery } from "~/interfaces";

export type { CreateEmojiPayload, DeleteEmojiPayload, GetEmojiQuery };

export const emojiApi = {
    createEmoji: (payload: CreateEmojiPayload) =>
        axiosInstance.post<BaseResponse<IEmoji>>('/emoji/create', payload),

    reactMessage: (payload: CreateEmojiPayload) =>
        axiosInstance.post<BaseResponse<IEmoji>>('/emoji/create', payload),

    deleteEmoji: (payload: DeleteEmojiPayload) =>
        axiosInstance.delete<BaseResponse<IEmoji>>('/emoji/delete', { data: payload }),

    getEmojisByMessage: (messageId: string, page: number = 1, limit: number = 20) =>
        axiosInstance.get<PaginatedResponse<IEmoji>>(
            `/emoji/${messageId}?page=${page}&limit=${limit}&messageId=${messageId}`
        ),

    getEmojis: ({ messageId, page = 1, limit = 20 }: GetEmojiQuery) =>
        axiosInstance.get<PaginatedResponse<IEmoji>>(
            `/emoji/${messageId}?page=${page}&limit=${limit}&messageId=${messageId}`
        ),
};
