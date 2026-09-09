import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { postApi } from "~/api";

export const usePostMutation = () => {
    const queryClient = useQueryClient();

    const createPost = useMutation({
        mutationFn: (payload: { caption?: string; media: Array<{ url: string; type?: 'image' | 'video' } | string> }) => {
            return postApi.createPost(payload);
        },
        onSuccess: (res) => {
            const newPost = res.data?.post || (res.data as any)?.data;
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
