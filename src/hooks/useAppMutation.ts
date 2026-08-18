import { useQueryClient, useMutation} from "@tanstack/react-query";
import { Alert } from "react-native";
import { commentApi, conversationApi, followApi, likeApi, postApi, messageApi, authApi } from "~/api";
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
        const queryKey = [targetType]; 
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.pages) return old;
            return {
                ...old,
                pages: old.pages.map((page: any) => ({
                    ...page,
                    data: page.data.map((item: any) =>
                        item._id === targetId
                            ? { 
                                ...item, 
                                isLiked: isLike, 
                                likeCount: isLike ? item.likeCount + 1 : Math.max(0, item.likeCount - 1) 
                              }
                            : item
                    )
                }))
            };
        });

        return { previousData, queryKey };
    };

    const createLike = useMutation({
        mutationFn: (params: {targetId: string, targetType: string}) => {
            if(!params.targetId || !params.targetType){throw new Error("Missing create like params")}
            return likeApi.createLike(params)
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, true);
        },
        onError: (context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
            Alert.alert("Lỗi thích nội dung");
        },
        onSettled: (context: any) => {
            if (context?.queryKey) {
                queryClient.invalidateQueries({ queryKey: context.queryKey });
            }
        }
    })

    const deleteLike = useMutation({
        mutationFn: (params: {targetId: string, targetType: string}) => {
            if(!params.targetId || !params.targetType){throw new Error("Missing delete like params")}
            return likeApi.deleteLike(params)
        },
        onMutate: async (params) => {
            return await updateCacheOptimistically(params.targetId, params.targetType, false);
        },
        onError: (context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
            Alert.alert("Lỗi bỏ thích nội dung");
        },
        onSettled: (context: any) => {
            if (context?.queryKey) {
                queryClient.invalidateQueries({ queryKey: context.queryKey });
            }
        }
    })
    
    return { createLike, deleteLike}
}

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
