import { Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import axiosInstance from '~/services/axiosClient';
import axios from 'axios';
import { IMedia } from '~/interfaces';

export interface GetUploadUrlPayload {
    filename: string;
    contentType: string;
}

export interface ConfirmUploadPayload {
    key: string;
    postId?: string;
    messageId?: string;
}

export const resolveLocalMediaUri = async (uri: string): Promise<string> => {
    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
        try {
            const photoData = await CameraRoll.iosGetImageDataById(uri, {
                convertHeicImages: true,
                quality: 0.9,
            });
            if (photoData?.node?.image?.filepath) {
                return photoData.node.image.filepath;
            }
            if (photoData?.node?.image?.uri) {
                return photoData.node.image.uri;
            }
        } catch (error) {
            console.log('Error resolving ph:// uri via CameraRoll:', error);
        }
    }
    return uri;
};

export const mediaApi = {
    uploadImage: async (rawUri: string, postId?: string, messageId?: string): Promise<{ url: string; media?: IMedia }> => {
        const fileUri = await resolveLocalMediaUri(rawUri);

        const formData = new FormData();
        const filename = fileUri.split('/').pop() || `photo_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

        formData.append('file', {
            uri: fileUri,
            name: filename,
            type: type,
        } as any);

        if (postId) formData.append('postId', postId);
        if (messageId) formData.append('messageId', messageId);

        const res = await axiosInstance.post<{ url: string; media: IMedia }>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return res.data;
    },

    getUploadUrl: (payload: GetUploadUrlPayload) =>
        axiosInstance.post<{ uploadUrl: string; key: string }>('/media/upload-url', payload),

    confirmUpload: (payload: ConfirmUploadPayload) =>
        axiosInstance.post<{ status: string }>('/media/confirm-upload', payload),

    createMedia: (payload: { url: string; type?: string; postId?: string; messageId?: string }) =>
        axiosInstance.post<{ message: string; media: IMedia }>('/media', payload),

    getMedia: (id: string) =>
        axiosInstance.get<{ media: IMedia }>(`/media/${id}`),

    uploadFileToPresignedUrl: async (uploadUrl: string, fileUri: string, contentType: string) => {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        return axios.put(uploadUrl, blob, {
            headers: {
                'Content-Type': contentType,
            },
        });
    },
};
