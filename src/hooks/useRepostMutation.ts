import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { repostApi } from "~/api";

export const useRepostMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isRepost: boolean) => {
        const queryKeys =
            targetType === "Reel" ? [['Reel'], ['Reels']] : [['Post'], ["Posts"]];
        const previousDataMap: Array<{ queryKey: any[]; data: any }> = [];
        const updateItem = (item: any) => {
            if (!item || item.id !== targetId) return item;
            return {
                ...item,
                isReposted: isRepost,
                repostCount: isRepost
                    ? ((item.repostCount || 0) + 1)
                    : Math.max(0, (item.repostCount || 0) - 1),
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

    const createRepost = useMutation({
        mutationFn: (params: { targetId: string; targetType: string }) => {
            if (!params.targetId || !params.targetType) {
                throw new Error("Missing create repost params");
            }
            return repostApi.createRepost(params);
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, true);
        },
        onError: (error: any, _variables, context: any) => {
            if (context?.previousDataMap) {
                context.previousDataMap.forEach((entry: any) => {
                    queryClient.setQueryData(entry.queryKey, entry.data);
                });
            }
            const msg = error?.response?.data?.message || error?.message || "Lỗi đăng lại nội dung";
            Alert.alert("Lỗi đăng lại nội dung", msg);
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.queryKeys) {
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            queryClient.invalidateQueries({ queryKey: ['reposts'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });

    const deleteRepost = useMutation({
        mutationFn: (params: { targetId: string; targetType: string }) => {
            if (!params.targetId || !params.targetType) throw new Error("Missing delete repost params");
            return repostApi.deleteRepost(params);
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, false);
        },
        onError: (error: any, _variables, context: any) => {
            if (context?.previousDataMap) {
                context.previousDataMap.forEach((entry: any) => {
                    queryClient.setQueryData(entry.queryKey, entry.data);
                });
            }
            const msg = error?.response?.data?.message || error?.message || "Lỗi hủy đăng lại nội dung";
            Alert.alert("Lỗi hủy đăng lại", msg);
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.queryKeys) {
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            queryClient.invalidateQueries({ queryKey: ['reposts'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });

    return { createRepost, deleteRepost };
};
