import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { followApi } from "~/api";

export const useFollowMutation = () => {
    const queryClient = useQueryClient();

    const updateFollowCacheOptimistically = async (followingId: string, isFollow: boolean) => {
        const queryKeys = [['Post'], ['Posts'], ['Reel'], ['Reels'], ['profile'], ['userProfile']];

        const updateItem = (item: any) => {
            if (!item) return item;
            const isTarget =
                item.userId === followingId ||
                item.user?.id === followingId;
            if (isTarget) {
                return {
                    ...item,
                    isFollowing: isFollow,
                    user: item.user
                        ? {
                              ...item.user,
                              isFollowing: isFollow,
                              follower: isFollow
                                  ? (item.user.follower || 0) + 1
                                  : Math.max(0, (item.user.follower || 0) - 1),
                          }
                        : item.user,
                };
            }
            return item;
        };

        for (const queryKey of queryKeys) {
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;
                if (Array.isArray(old.pages)) {
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => {
                            if (!page) return page;
                            const newPage = { ...page };
                            if (Array.isArray(page.data)) newPage.data = page.data.map(updateItem);
                            if (Array.isArray(page.reels)) newPage.reels = page.reels.map(updateItem);
                            return newPage;
                        }),
                    };
                }
                return old;
            });
        }
    };

    const createFollow = useMutation({
        mutationFn: (followingId: string) => {
            if (!followingId) {
                throw new Error("Missing create follow params");
            }
            return followApi.createFollow(followingId);
        },
        onMutate: async (followingId) => {
            await updateFollowCacheOptimistically(followingId, true);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['Post'] });
            queryClient.invalidateQueries({ queryKey: ['Posts'] });
        },
        onError: () => {
            Alert.alert("Lỗi theo dõi tài khoản");
        },
    });

    const deleteFollow = useMutation({
        mutationFn: (followingId: string) => {
            if (!followingId) {
                throw new Error("Missing delete follow params");
            }
            return followApi.deleteFollow(followingId);
        },
        onMutate: async (followingId) => {
            await updateFollowCacheOptimistically(followingId, false);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['Post'] });
            queryClient.invalidateQueries({ queryKey: ['Posts'] });
        },
        onError: () => {
            Alert.alert("Lỗi huỷ theo dõi tài khoản");
        },
    });

    return { createFollow, deleteFollow };
};
