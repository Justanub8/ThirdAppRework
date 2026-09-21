import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { reelApi, CreateReelPayload } from "~/api";

export const useReelMutation = () => {
    const queryClient = useQueryClient();

    const createReel = useMutation({
        mutationFn: (payload: CreateReelPayload) => {
            return reelApi.createReel({
                caption: payload.caption || '',
                mediaId: payload.mediaId,
                videoUrl: payload.videoUrl,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['Reels'] });
            queryClient.invalidateQueries({ queryKey: ['reels'] });
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Lỗi tạo thước phim";
            Alert.alert("Lỗi tạo thước phim", msg);
        },
    });

    return { createReel };
};
