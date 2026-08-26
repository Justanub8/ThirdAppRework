import axiosInstance from "~/services/axiosClient";

export interface SharePayload {
    targetId: string;
    targetType: 'Post' | 'Reel' | 'Story' | string;
}

export const shareApi = {
    createShare: (payload: SharePayload) =>
        axiosInstance.post<{ message: string; share?: any }>('/share/create', payload),
};
