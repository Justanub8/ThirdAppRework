import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { likeApi } from "~/api";

export const useLikeMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isLike: boolean) => {
        const queryKeys =
            targetType === 'Reel'
                ? [['Reel'], ['Reels']]
                : targetType === 'Comment'
                ? [['comments']]
                : [['Post'], ['Posts']];

        const previousDataMap: Array<{ queryKey: any[]; data: any }> = [];

        const updateItem = (item: any) => {
            if (!item || item.id !== targetId) return item;
            return {
                ...item,
                isLiked: isLike,
                likeCount: isLike
                    ? ((item.likeCount || 0) + 1)
                    : Math.max(0, (item.likeCount || 0) - 1),
            };
        };

        const updatePage = (page: any) => {
            if (!page) return page;
            const newPage = { ...page };
            if (Array.isArray(page.data)) {
                newPage.data = page.data.map(updateItem);
            }
            if (Array.isArray(page.reels)) {
                newPage.reels = page.reels.map(updateItem);
            }
            return newPage;
        };

        for (const queryKey of queryKeys) {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            if (previousData) {
                previousDataMap.push({ queryKey, data: previousData });
            }

            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;
                if (Array.isArray(old.pages)) {
                    return {
                        ...old,
                        pages: old.pages.map(updatePage),
                    };
                }
                return updatePage(old);
            });
        }

        return { previousDataMap, queryKeys };
    };

    const createLike = useMutation({
        mutationFn: (params: { targetId: string; targetType: string }) => {
            if (!params.targetId || !params.targetType) {
                throw new Error("Missing create like params");
            }
            return likeApi.createLike(params);
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, true);
        },
        onError: (_error, _variables, context: any) => {
            if (context?.previousDataMap) {
                context.previousDataMap.forEach((entry: any) => {
                    queryClient.setQueryData(entry.queryKey, entry.data);
                });
            }
            Alert.alert("Lỗi thích nội dung");
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.queryKeys) {
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
        },
    });

    const deleteLike = useMutation({
        mutationFn: (params: { targetId: string; targetType: string }) => {
            if (!params.targetId || !params.targetType) {
                throw new Error("Missing delete like params");
            }
            return likeApi.deleteLike(params);
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, false);
        },
        onError: (_error, _variables, context: any) => {
            if (context?.previousDataMap) {
                context.previousDataMap.forEach((entry: any) => {
                    queryClient.setQueryData(entry.queryKey, entry.data);
                });
            }
            Alert.alert("Lỗi bỏ thích nội dung");
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.queryKeys) {
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
        },
    });

    return { createLike, deleteLike };
};
