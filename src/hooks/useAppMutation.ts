import { useQueryClient, useMutation} from "@tanstack/react-query";
import { Alert } from "react-native";
import { commentApi, conversationApi, followApi, likeApi, postApi, messageApi, authApi, bookmarkApi, repostApi } from "~/api";
import { ILoginPayLoad, ISignUpPayload } from "~/interfaces";
import { useAuthStore } from "./useAuthStore";

export const useCommentMutation = () => {
    const queryClient = useQueryClient();
    const createComment = useMutation({
        mutationFn: (params: { targetId: string, targetType: string, content: string}) => {
            if(!params.targetId || !params.content || !params.targetType ){throw new Error("Missing params create comment")}
            return commentApi.createComment(params)
        },
        onSuccess:(_,variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', variables.targetId] });
        },
        onError:() => {
            Alert.alert("Lỗi tạo comment mới")
        }
    })
    return { createComment }
}

export const useLikeMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isLike: boolean) => {
        const queryKeys = targetType === 'Reel' 
            ? [['Reel'], ['Reels']] 
            : [['Post'], ['Posts']];

        const previousDataMap: Array<{ queryKey: any[]; data: any }> = [];

        const updateItem = (item: any) => {
            if (!item || item._id !== targetId) return item;
            return {
                ...item,
                isLiked: isLike,
                likeCount: isLike 
                    ? ((item.likeCount || 0) + 1) 
                    : Math.max(0, (item.likeCount || 0) - 1)
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
                        pages: old.pages.map(updatePage)
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
        }
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
        }
    });
    
    return { createLike, deleteLike };
};

export const useFollowMutation = () => {
    const queryClient = useQueryClient();
    const createFollow = useMutation({
        mutationFn: (followingId: string) => {
            if(!followingId){throw new Error("Missing create follow params")}
            return followApi.createFollow(followingId)
        },
        onSettled:() => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError:() => {Alert.alert("Lỗi theo dõi tài khoản")}
    })
    const deleteFollow = useMutation({
        mutationFn: (followingId: string) => {
            if(!followingId){throw new Error("Missing create follow params")}
            return followApi.deleteFollow(followingId)
        },
        onSettled:() => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError:() => {Alert.alert("Lỗi huỷ theo dõi tài khoản")}
    })
    return { createFollow, deleteFollow }
}

export const useConversationMutation = () => {
    const queryClient = useQueryClient();
    const createConversation = useMutation({
        mutationFn: (targetId: string) => {
            if(!targetId){throw new Error("Missing conversation params")}
            return conversationApi.createConversation(targetId)
        },
        onSuccess:() => {
            queryClient.invalidateQueries({queryKey: ['conversations']});
        },
        onError:() => {
            Alert.alert("Lỗi khi tạo cuộc trò chuyện")
        }
    })
    return { createConversation}
}

export const useMessageMutation = () => {
    const queryClient = useQueryClient();
    const createMessage = useMutation({
        mutationFn: (params: {conversationId: string, content: string}) => {
            if(!params.conversationId || !params.content){throw new Error("Missing create message params")};
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
        }
    })
    const editMessage = useMutation({
        mutationFn: (params: {messageId: string, content: string}) => {
            if(!params.messageId || !params.content){throw new Error("Missing edit message params")}
            return messageApi.editMessage(params);
        },
        onSuccess:() => {
            queryClient.invalidateQueries({queryKey: ['messages']})
        },
        onError:() => {
            Alert.alert("Lỗi khi chỉnh sửa tin nhắn")
        }
    })
    return { createMessage, editMessage}
}

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
        }
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
        }
    });

    return { signUp, login };
};

export const useBookmarkMutation = () => {
    const queryClient = useQueryClient();

    const updateCacheOptimistically = async (targetId: string, targetType: string, isBookmarked: boolean) => {
        const queryKeys = targetType === 'Reel' 
            ? [['Reel'], ['Reels']] 
            : [['Post'], ['Posts']];

        const previousDataMap: Array<{ queryKey: any[]; data: any }> = [];

        const updateItem = (item: any) => {
            if (!item || item._id !== targetId) return item;
            return {
                ...item,
                isBookmarked,
                bookmarkCount: isBookmarked 
                    ? ((item.bookmarkCount || 0) + 1) 
                    : Math.max(0, (item.bookmarkCount || 0) - 1)
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
                        pages: old.pages.map(updatePage)
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
        }
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
        }
    });

    return { createBookmark, deleteBookmark };
};

export const useRepostMutation = () => {
    const queryClient = useQueryClient();
    
    const updateCacheOptimistically = async (targetId: string, targetType: string, isRepost: boolean) => {
        const queryKeys = targetType === "Reel"
            ? [['Reel'], ['Reels']]
            : [['Post'], ["Posts"]];
        const previousDataMap: Array<{queryKey: any[], data: any}> = [];
        const updateItem = (item: any) => {
            if(!item || item._id !== targetId) return item;
            return {
                ...item,
                isReposted: isRepost,
                repostCount: isRepost 
                    ? ((item.repostCount || 0) + 1)
                    : Math.max(0, (item.repostCount || 0) - 1)
            };
        };

        const updatePage = (page: any) => {
            if(!page) return page;
            const newPage = {...page};
            if(Array.isArray(page.data)){
                newPage.data = page.data.map(updateItem);
            }
            if(Array.isArray(page.reels)){
                newPage.reels = page.reels.map(updateItem);
            }
            return newPage;
        };

        for (const queryKey of queryKeys){
            await queryClient.cancelQueries({ queryKey});
            const previousData = queryClient.getQueryData(queryKey);
            if(previousData){
                previousDataMap.push({queryKey, data: previousData});
            }

            queryClient.setQueryData(queryKey, (old: any) => {
                if(!old) return old;
                if(Array.isArray(old.pages)){
                    return {
                        ...old,
                        pages: old.pages.map(updatePage)
                    };
                }
                return updatePage(old);
            });
        }
        return { previousDataMap, queryKeys};
    };
    const createRepost = useMutation({
        mutationFn: (params: {targetId: string; targetType: string}) => {
            if(!params.targetId || !params.targetType){
                throw new Error("Missing create repost params");
            }
            return repostApi.createRepost(params);
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, true);
        },
        onError: (error: any, _variables, context: any) => {
            if(context?.previousDataMap){
                context.previousDataMap.forEach((entry: any) => {
                    queryClient.setQueryData(entry.queryKey, entry.data);
                });
            }
            const msg = error?.response?.data?.message || error?.message || "Lỗi đăng lại nội dung";
            Alert.alert("Lỗi đăng lại nội dung", msg);
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if(context?.queryKeys){
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({queryKey: key});
                });
            }
            queryClient.invalidateQueries({ queryKey: ['reposts']});
            queryClient.invalidateQueries({ queryKey: ['userProfile']});
        }
    });

    const deleteRepost = useMutation({
        mutationFn: (params: { targetId: string, targetType: string}) => {
            if(!params.targetId || !params.targetType) throw new Error("Missing delete repost params");
            return repostApi.deleteRepost(params);
        },
        onMutate: async(params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, false);
        },
        onError: (error: any, _variables, context: any) => {
            if(context?.previousDataMap){
                context.previousDataMap.forEach((entry: any) => {
                    queryClient.setQueryData(entry.queryKey, entry.data);
                });
            }
            const msg = error?.response?.data?.message || error?.message || "Lỗi hủy đăng lại nội dung";
            Alert.alert("Lỗi hủy đăng lại", msg);
        },
        onSettled: (_data, _error, _variables, context: any) => {
            if(context?.queryKeys){
                context.queryKeys.forEach((key: any[]) => {
                    queryClient.invalidateQueries({queryKey: key});
                });
            }
            queryClient.invalidateQueries({ queryKey: ['reposts']});
            queryClient.invalidateQueries({ queryKey: ['userProfile']});
        }
    });

    return { createRepost, deleteRepost };
};