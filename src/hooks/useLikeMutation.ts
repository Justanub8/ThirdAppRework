import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { likeApi } from "~/api";

export const useLikeMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isLike: boolean) => {
        const baseQueryKeys =
            targetType === 'Reel'
                ? [['Reel'], ['Reels']]
                : targetType === 'Comment'
                ? [['comments']]
                : targetType === 'Story'
                ? [['story'], ['stories'], ['my-story']]
                : [['Post'], ['Posts']];

        const previousDataMap: Array<{ queryKey: any; data: any }> = [];

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
            if (Array.isArray(page)) {
                return page.map(updateItem);
            }
            const newPage = { ...page };
            if (Array.isArray(page.data)) {
                newPage.data = page.data.map(updateItem);
            }
            if (Array.isArray(page.stories)) {
                newPage.stories = page.stories.map(updateItem);
            }
            if (Array.isArray(page.reels)) {
                newPage.reels = page.reels.map(updateItem);
            }
            return newPage;
        };

        const updateData = (old: any) => {
            if (!old) return old;
            if (Array.isArray(old)) {
                return old.map(updateItem);
            }
            if (Array.isArray(old.pages)) {
                return {
                    ...old,
                    pages: old.pages.map(updatePage),
                };
            }
            return updatePage(old);
        };

        for (const baseKey of baseQueryKeys) {
            await queryClient.cancelQueries({ queryKey: baseKey });
            const matchingQueries = queryClient.getQueriesData({ queryKey: baseKey });

            for (const [qKey, previousData] of matchingQueries) {
                if (previousData !== undefined) {
                    previousDataMap.push({ queryKey: qKey, data: previousData });
                    queryClient.setQueryData(qKey, (old: any) => updateData(old));
                }
            }
        }

        return { previousDataMap, baseQueryKeys };
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
            if (context?.baseQueryKeys) {
                context.baseQueryKeys.forEach((key: any[]) => {
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
            if (context?.baseQueryKeys) {
                context.baseQueryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
        },
    });

    return { createLike, deleteLike };
};
