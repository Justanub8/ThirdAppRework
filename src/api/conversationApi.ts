import axiosInstance from "~/services/axiosClient";
import { IConversation } from "~/interfaces";
import { PaginatedResponse } from "./api";

export const conversationApi = {
    getConversations: (page: number = 1, limit: number = 20) => 
        axiosInstance.get<PaginatedResponse<IConversation>>(`/conversation?page=${page}&limit=${limit}`),
    
    createConversation: (targetId: string, participantIds?: string[], isGroup?: boolean) => 
        axiosInstance.post<{ message: string; data: IConversation }>('/conversation', { targetId, participantIds, isGroup }),
    
    getConversationById: (id: string) => 
        axiosInstance.get<{ data: IConversation }>(`/conversation/${id}`),
};