import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
    commentApi,
    conversationApi,
    followApi,
    likeApi,
    postApi,
    messageApi,
    authApi,
    bookmarkApi,
    repostApi,
} from "~/api";
import { ILoginPayLoad, ISignUpPayload } from "~/interfaces";
import { useAuthStore } from "./useAuthStore";

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
                if (!item || (item.id !== variables.targetId && item._id !== variables.targetId)) return item;
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
            if (!item || (item.id !== targetId && item._id !== targetId)) return item;
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

export const useFollowMutation = () => {
    const queryClient = useQueryClient();

    const updateFollowCacheOptimistically = async (followingId: string, isFollow: boolean) => {
        const queryKeys = [['Post'], ['Posts'], ['Reel'], ['Reels'], ['profile'], ['userProfile']];

        const updateItem = (item: any) => {
            if (!item) return item;
            const isTarget =
                item.userId === followingId ||
                item.user?.id === followingId ||
                item.user?._id === followingId;
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

export const useBookmarkMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isBookmarked: boolean) => {
        const queryKeys =
            targetType === 'Reel' ? [['Reel'], ['Reels']] : [['Post'], ['Posts']];

        const previousDataMap: Array<{ queryKey: any[]; data: any }> = [];

        const updateItem = (item: any) => {
            if (!item || (item.id !== targetId && item._id !== targetId)) return item;
            return {
                ...item,
                isBookmarked,
                bookmarkCount: isBookmarked
                    ? ((item.bookmarkCount || 0) + 1)
                    : Math.max(0, (item.bookmarkCount || 0) - 1),
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

    const createBookmark = useMutation({
        mutationFn: (params: { targetId: string; targetType: string }) => {
            if (!params.targetId || !params.targetType) {
                throw new Error("Missing create bookmark params");
            }
            return bookmarkApi.createBookmark(params);
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
            const msg = error?.response?.data?.message || error?.message || "Lỗi lưu nội dung";
            Alert.alert("Lỗi lưu nội dung", msg);
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.queryKeys) {
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });

    const deleteBookmark = useMutation({
        mutationFn: (params: { targetId: string; targetType: string }) => {
            if (!params.targetId || !params.targetType) {
                throw new Error("Missing delete bookmark params");
            }
            return bookmarkApi.deleteBookmark(params);
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
            const msg = error?.response?.data?.message || error?.message || "Lỗi bỏ lưu nội dung";
            Alert.alert("Lỗi bỏ lưu nội dung", msg);
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if (context?.queryKeys) {
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });

    return { createBookmark, deleteBookmark };
};

export const useRepostMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isRepost: boolean) => {
        const queryKeys =
            targetType === "Reel" ? [['Reel'], ['Reels']] : [['Post'], ["Posts"]];
        const previousDataMap: Array<{ queryKey: any[]; data: any }> = [];
        const updateItem = (item: any) => {
            if (!item || (item.id !== targetId && item._id !== targetId)) return item;
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

export const usePostMutation = () => {
    const queryClient = useQueryClient();

    const createPost = useMutation({
        mutationFn: (payload: { caption?: string; media: Array<{ url: string; type?: 'image' | 'video' } | string> }) => {
            return postApi.createPost(payload);
        },
        onSuccess: (res) => {
            const newPost = res.data?.post || res.data?.data;
            if (newPost) {
                for (const queryKey of [['Post'], ['Posts']]) {
                    queryClient.setQueryData(queryKey, (old: any) => {
                        if (!old) return old;
                        if (Array.isArray(old.pages)) {
                            const newPages = [...old.pages];
                            if (newPages[0]) {
                                newPages[0] = {
                                    ...newPages[0],
                                    data: [newPost, ...(newPages[0].data || [])],
                                };
                            }
                            return { ...old, pages: newPages };
                        }
                        return old;
                    });
                }
            }
            queryClient.invalidateQueries({ queryKey: ['Post'] });
            queryClient.invalidateQueries({ queryKey: ['Posts'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Lỗi tạo bài viết";
            Alert.alert("Lỗi tạo bài viết", msg);
        },
    });

    return { createPost };
};

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

export const useMessageMutation = () => {
    const queryClient = useQueryClient();
    const createMessage = useMutation({
        mutationFn: (params: { conversationId: string; content: string }) => {
            if (!params.conversationId || !params.content) {
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

export const useAuthMutation = () => {
    const { saveUser } = useAuthStore();

    const signUp = useMutation({
        mutationFn: (payload: ISignUpPayload) => {
            if (!payload.email || !payload.password || !payload.username) {
                throw new Error("Vui lòng điền đầy đủ thông tin");
            }
            return authApi.signUp(payload);
        },
        onSuccess: (res) => {
            const data = res.data;
            if (data && data.accessToken) {
                saveUser({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken || null,
                    user: data.user || null,
                });
            }
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Đăng ký không thành công";
            Alert.alert("Lỗi đăng ký", msg);
        },
    });

    const login = useMutation({
        mutationFn: (payload: ILoginPayLoad) => {
            if (!payload.email || !payload.password) {
                throw new Error("Vui lòng điền email và mật khẩu");
            }
            return authApi.login(payload);
        },
        onSuccess: (res) => {
            const data = res.data;
            if (data && data.accessToken) {
                saveUser({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken || null,
                    user: data.user || null,
                });
            }
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Đăng nhập không thành công";
            Alert.alert("Lỗi đăng nhập", msg);
        },
    });

    return { signUp, login };
};