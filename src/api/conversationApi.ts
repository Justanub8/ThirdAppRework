import axiosInstance from "~/services/axiosClient";

export const conversationApi = {
    getConversations: () => axiosInstance.get('conversation'),
    createConversation: (targetId: string) => axiosInstance.post('conversation', targetId)
}