import axiosInstance from "~/services/axiosClient";
import { IMessage } from "~/interfaces";
import { PaginatedResponse } from "./api";

export interface SendMessagePayload {
    conversationId: string;
    content?: string;
    mediaId?: string[];
}

export const messageApi = {
    getMessages: (conversationId: string, page: number = 1, limit: number = 20) => 
        axiosInstance.get<PaginatedResponse<IMessage>>(
            `/message/${conversationId}?page=${page}&limit=${limit}`
        ),
    
    sendMessage: ({ conversationId, content, mediaId }: SendMessagePayload) => 
        axiosInstance.post<{ message: string; data: IMessage }>(`/message/send/${conversationId}`, { content, mediaId, conversationId }),
        
    editMessage: ({ messageId, content }: { messageId: string; content: string }) => 
        axiosInstance.put<{ message: string; data: IMessage }>(`/message/${messageId}`, { content }),
};
