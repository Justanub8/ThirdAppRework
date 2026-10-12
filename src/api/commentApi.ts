import axiosInstance from '~/services/axiosClient';
import { IComment } from '~/interfaces';
import { PaginatedResponse } from '~/api/api';

export interface CreateCommentPayload {
  targetId: string;
  targetType: 'Post' | 'Reel' | 'Story' | 'Comment' | string;
  content?: string;
  parentId?: string;
  media?: { url: string; type?: string } | string;
  mediaUrl?: string;
}

export const commentApi = {
  getCommentsByTarget: (
    targetId: string,
    page: number = 1,
    limit: number = 20,
  ) =>
    axiosInstance.get<PaginatedResponse<IComment>>(
      `/comments/target/${targetId}?page=${page}&limit=${limit}`,
    ),

  getReplies: (parentId: string, page: number = 1, limit: number = 20) =>
    axiosInstance.get<PaginatedResponse<IComment>>(
      `/comments/replies/${parentId}?page=${page}&limit=${limit}`,
    ),

  createComment: (payload: CreateCommentPayload) =>
    axiosInstance.post<{ message: string; data: IComment; comment: IComment }>(
      `/comments`,
      payload,
    ),

  getComment: (commentId: string) =>
    axiosInstance.get<{ comment: IComment }>(`/comments/${commentId}`),

  updateComment: (commentId: string, content: string) =>
    axiosInstance.put<{ message: string; comment: IComment }>(
      `/comments/${commentId}`,
      { content },
    ),

  deleteComment: (commentId: string) =>
    axiosInstance.delete<{ message: string }>(`/comments/${commentId}`),
};
