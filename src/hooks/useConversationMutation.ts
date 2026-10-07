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
    const createGroupConversation = useMutation({
        mutationFn: (participantIds: string[]) => {
            if (!participantIds || participantIds.length < 2) {
                throw new Error("Nhóm chat cần chọn ít nhất 2 thành viên khác");
            }
            return conversationApi.createGroupConversation(participantIds);
        }, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['conversation'] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Lỗi khi tạo nhóm chat";
            Alert.alert("Lỗi", message);
        }
    });
    return { createConversation, createGroupConversation };
};
