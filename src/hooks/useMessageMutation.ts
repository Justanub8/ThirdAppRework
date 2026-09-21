import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { messageApi } from "~/api";

export const useMessageMutation = () => {
    const queryClient = useQueryClient();
    const createMessage = useMutation({
        mutationFn: (params: { conversationId: string; content?: string; mediaId?: string[] }) => {
            const hasMedia = params.mediaId && params.mediaId.length > 0;
            if (!params.conversationId || (!params.content && !hasMedia)) {
                throw new Error("Missing create message params");
            }
            return messageApi.sendMessage(params);
        },
        onMutate: async (params) => {
            const queryKey = ['messages', params.conversationId];
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            return { previousData, queryKey };
        },
        onError: (error, variables, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
            Alert.alert("Lỗi khi gửi tin nhắn");
        },
        onSettled: (data, error, variables, context: any) => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
    const editMessage = useMutation({
        mutationFn: (params: { messageId: string; content: string }) => {
            if (!params.messageId || !params.content) {
                throw new Error("Missing edit message params");
            }
            return messageApi.editMessage(params);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
        onError: () => {
            Alert.alert("Lỗi khi chỉnh sửa tin nhắn");
        },
    });
    return { createMessage, editMessage };
};
