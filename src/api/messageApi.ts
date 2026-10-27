import axiosInstance from '~/services/axiosClient';
import { IMessage, MessageStatus } from '~/interfaces';
import { PaginatedResponse } from '~/api/api';

export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  mediaId?: string[];
}

export const messageApi = {
  getMessages: (
    conversationId: string,
    page: number = 1,
    limit: number = 20,
    status?: MessageStatus,
  ) => {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;
    return axiosInstance.get<PaginatedResponse<IMessage>>(
      `/messages/${conversationId}`,
      { params },
    );
  },

  getPinnedMessages: (
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ) => messageApi.getMessages(conversationId, page, limit, 'Pinned'),

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
    status?: MessageStatus;
  }) =>
    axiosInstance.put<{ message: string; data: IMessage }>(
      `/messages/${messageId}`,
      { content, status },
    ),

  pinMessage: ({
    messageId,
    status = 'Pinned',
  }: {
    messageId: string;
    status?: MessageStatus;
  }) =>
    axiosInstance.put<{ message: string; data: IMessage }>(
      `/messages/${messageId}`,
      { status },
    ),

  deleteMessage: (messageId: string) =>
    axiosInstance.put<{ message: string; data: IMessage }>(
      `/messages/${messageId}`,
      { status: 'Deleted' },
    ),
};
