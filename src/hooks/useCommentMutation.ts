import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { commentApi } from "~/api";

export const useCommentMutation = () => {
    const queryClient = useQueryClient();

    const createComment = useMutation({
        mutationFn: (params: { targetId: string; targetType: string; content: string; parentId?: string }) => {
            if (!params.targetId || !params.content || !params.targetType) {
                throw new Error("Missing params create comment");
            }
            return commentApi.createComment(params);
        },
        onSuccess: (res, variables) => {
            const newComment = res.data?.data || res.data?.comment;

            // 1. Chèn ngay comment mới vào đầu danh sách comments trong cache (hiện tức thì 0ms)
            if (newComment) {
                queryClient.setQueryData(['comments', variables.targetId], (oldData: any) => {
                    if (!oldData) return oldData;
                    if (Array.isArray(oldData.pages)) {
                        const newPages = [...oldData.pages];
                        if (newPages[0]) {
                            newPages[0] = {
                                ...newPages[0],
                                data: [newComment, ...(newPages[0].data || [])],
                            };
                        }
                        return { ...oldData, pages: newPages };
                    }
                    return oldData;
                });
            }

            // 2. Tăng commentCount trên Post/Reel trong cache
            const updateCount = (item: any) => {
                if (!item || item.id !== variables.targetId) return item;
                return {
                    ...item,
                    commentCount: (item.commentCount || 0) + 1,
                };
            };

            const updatePages = (old: any) => {
                if (!old) return old;
                if (Array.isArray(old.pages)) {
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => {
                            if (!page) return page;
                            const newPage = { ...page };
                            if (Array.isArray(page.data)) newPage.data = page.data.map(updateCount);
                            if (Array.isArray(page.reels)) newPage.reels = page.reels.map(updateCount);
                            return newPage;
                        }),
                    };
                }
                return old;
            };

            const targetKeys = variables.targetType === 'Reel' ? [['Reel'], ['Reels']] : [['Post'], ['Posts']];
            for (const key of targetKeys) {
                queryClient.setQueryData(key, updatePages);
            }

            queryClient.invalidateQueries({ queryKey: ['comments', variables.targetId] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Lỗi tạo bình luận";
            Alert.alert("Lỗi tạo bình luận", msg);
        },
    });

    return { createComment };
};
