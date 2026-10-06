import axiosInstance from "~/services/axiosClient";
import { IConversation, ConversationRole } from "~/interfaces";
import { PaginatedResponse } from "./api";

export const conversationApi = {
    getConversations: (page: number = 1, limit: number = 20) => 
        axiosInstance.get<PaginatedResponse<IConversation>>(`/conversation?page=${page}&limit=${limit}`),
    
    createConversation: (targetId: string, participantIds?: string[], isGroup?: boolean) => 
        axiosInstance.post<{ message: string; data: IConversation }>('/conversation', { targetId, participantIds, isGroup }),
    
    createGroupConversation: (participantIds: string[], name?: string, avatarUrl?: string) => 
        axiosInstance.post<{ message: string; data: IConversation }>('/conversation', { 
            participantIds, 
            isGroup: true,
            name,
            avatarUrl,
        }),
    
    getConversationById: (id: string) => 
        axiosInstance.get<{ data: IConversation }>(`/conversation/${id}`),

    updateGroup: (id: string, data: { name?: string; avatarUrl?: string }) =>
        axiosInstance.patch<{ message: string; data: IConversation }>(`/conversation/${id}`, data),

    updateMemberRole: (id: string, targetUserId: string, role: ConversationRole) =>
        axiosInstance.patch<{ message: string }>(`/conversation/${id}/members/${targetUserId}/role`, { role }),

    updateMemberNickname: (id: string, targetUserId: string, nickname?: string) =>
        axiosInstance.patch<{ message: string; data: any }>(`/conversation/${id}/members/${targetUserId}/nickname`, { nickname }),
};