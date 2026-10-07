import axiosInstance from '~/services/axiosClient';
import axios from 'axios';
import { IMedia } from '~/interfaces';
import { resolveLocalMediaUri, isVideoMedia, getMediaMimeType } from '~/utils/mediaUtils';

export interface GetUploadUrlPayload {
  filename: string;
  contentType: string;
}

export interface ConfirmUploadPayload {
  key: string;
  postId?: string;
  messageId?: string;
}

export const mediaApi = {
  // Luồng upload multipart (trực tiếp qua NestJS Server)
  uploadImage: async (
    rawUri: string,
    postId?: string,
    messageId?: string,
    isVideoParam?: boolean,
    customFilename?: string,
  ): Promise<{ url: string; media?: IMedia }> => {
    const isExplicitVideo = isVideoMedia(rawUri, customFilename, Boolean(isVideoParam));
    const fileUri = await resolveLocalMediaUri(rawUri, customFilename, isExplicitVideo);

    const formData = new FormData();
    const cleanUri = fileUri.split('?')[0];
    const rawName = customFilename || cleanUri.split('/').pop() || `file_${Date.now()}`;
    const isVideo = isExplicitVideo;
    const mimeType = getMediaMimeType(fileUri, customFilename, isVideo);

    const uploadName = rawName.includes('.') ? rawName : `${rawName}.${isVideo ? 'mp4' : 'jpg'}`;

    formData.append('file', {
      uri: fileUri,
      name: uploadName,
      type: mimeType,
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

  confirmImageUpload: (payload: ConfirmUploadPayload) =>
    axiosInstance.post<{ status: string }>('/media/confirm-image-upload', payload),

  confirmVideoUpload: (payload: ConfirmUploadPayload) =>
    axiosInstance.post<{ status: string }>('/media/confirm-video-upload', payload),

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

