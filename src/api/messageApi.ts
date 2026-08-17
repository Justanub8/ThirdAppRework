import axiosInstance from "~/services/axiosClient";
import { ApiRes, PaginatedRes } from "./api";
import { IMessage } from "~/interfaces";

export const messageApi = {
    getMessages: (conversationId: string, page: number , pageSize: number) => 
        axiosInstance.get<ApiRes<PaginatedRes<IMessage>>>(`message/${conversationId}?page=${page}&limit=${pageSize}`),
    
    sendMessage: ({conversationId, content}: {conversationId: string, content: string}) => 
        axiosInstance.post(`message/send/${conversationId}`, { content }),
        
    editMessage: ({messageId, content}: {messageId: string, content: string}) => 
        axiosInstance.put(`message/${messageId}`, { content })
}
