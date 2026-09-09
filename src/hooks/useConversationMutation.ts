import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { conversationApi } from "~/api";

export const useConversationMutation = () => {
    const queryClient = useQueryClient();
    const createConversation = useMutation({
        mutationFn: (targetId: string) => {
            if (!targetId) {
                throw new Error("Missing conversation params");
            }
            return conversationApi.createConversation(targetId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: () => {
            Alert.alert("Lỗi khi tạo cuộc trò chuyện");
        },
    });
    return { createConversation };
};
