import axiosInstance from '~/services/axiosClient';
import { IMessage } from '~/interfaces';
import { PaginatedResponse } from '~/api/api';

export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  mediaId?: string[];
}

export const messageApi = {
  getMessages: (conversationId: string, page: number = 1, limit: number = 20) =>
    axiosInstance.get<PaginatedResponse<IMessage>>(
      `/messages/${conversationId}?page=${page}&limit=${limit}`,
    ),

  sendMessage: ({ conversationId, content, mediaId }: SendMessagePayload) =>
    axiosInstance.post<{ message: string; data: IMessage }>('/messages', {
      content,
      mediaId,
      conversationId,
    }),

  editMessage: ({
    messageId,
    content,
    status = 'Edited',
  }: {
    messageId: string;
    content?: string | null;
    status?: string;
  }) =>
    axiosInstance.put<{ message: string; data: IMessage }>(
      `/messages/${messageId}`,
      { content, status },
    ),
};
