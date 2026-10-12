import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { storyApi } from '~/api';
import { useAuthStore } from '~/hooks/useAuthStore';

export const useStoryMutation = () => {
  const queryClient = useQueryClient();

  const createStory = useMutation({
    mutationFn: (payload: {
      mediaId?: string;
      mediaUrl?: string;
      media?: { id?: string; url: string; type?: 'image' | 'video' };
      type?: 'image' | 'video' | string;
      content?: string;
    }) => {
      const mediaId =
        payload.mediaId ||
        ('media' in payload && payload.media?.id) ||
        undefined;
      const mediaUrl =
        'mediaUrl' in payload && payload.mediaUrl
          ? payload.mediaUrl
          : payload.media?.url;
      const type =
        ('type' in payload && payload.type) ||
        ('media' in payload && payload.media?.type) ||
        'image';
      return storyApi.createStory({
        content: payload.content,
        mediaId,
        mediaUrl,
        type,
      });
    },
    onSuccess: () => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().updateUser({
          ...currentUser,
          hasActiveStory: true,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['my-story'] });
      queryClient.invalidateQueries({ queryKey: ['followedStories'] });
      queryClient.invalidateQueries({ queryKey: ['story'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || error?.message || 'Lỗi tạo tin';
      Alert.alert('Lỗi tạo tin', msg);
    },
  });

  return { createStory };
};
