import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { bookmarkApi } from '~/api';
import {
  getTargetQueryKeys,
  updateFeedEntityInCache,
  rollbackOptimisticUpdates,
} from '~/utils';

export const useBookmarkMutation = () => {
  const queryClient = useQueryClient();

  const updateBookmarkCache = (
    targetId: string,
    targetType: string,
    isBookmarked: boolean,
  ) => {
    const queryKeys = getTargetQueryKeys(targetType);
    return updateFeedEntityInCache(queryClient, queryKeys, item => {
      if (item.id !== targetId) return item;
      return {
        ...item,
        isBookmarked,
        bookmarkCount: isBookmarked
          ? (item.bookmarkCount || 0) + 1
          : Math.max(0, (item.bookmarkCount || 0) - 1),
      };
    });
  };

  const createBookmark = useMutation({
    mutationFn: (params: { targetId: string; targetType: string }) => {
      if (!params.targetId || !params.targetType) {
        throw new Error('Missing create bookmark params');
      }
      return bookmarkApi.createBookmark(params);
    },
    onMutate: async params => {
      const previousDataMap = await updateBookmarkCache(
        params.targetId,
        params.targetType,
        true,
      );
      return { previousDataMap, targetType: params.targetType };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousDataMap) {
        rollbackOptimisticUpdates(queryClient, context.previousDataMap);
      }
      const msg =
        error?.response?.data?.message || error?.message || 'Lỗi lưu nội dung';
      Alert.alert('Lỗi lưu nội dung', msg);
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.targetType) {
        const keys = getTargetQueryKeys(variables.targetType);
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const deleteBookmark = useMutation({
    mutationFn: (params: { targetId: string; targetType: string }) => {
      if (!params.targetId || !params.targetType) {
        throw new Error('Missing delete bookmark params');
      }
      return bookmarkApi.deleteBookmark(params);
    },
    onMutate: async params => {
      const previousDataMap = await updateBookmarkCache(
        params.targetId,
        params.targetType,
        false,
      );
      return { previousDataMap, targetType: params.targetType };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousDataMap) {
        rollbackOptimisticUpdates(queryClient, context.previousDataMap);
      }
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi bỏ lưu nội dung';
      Alert.alert('Lỗi bỏ lưu nội dung', msg);
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.targetType) {
        const keys = getTargetQueryKeys(variables.targetType);
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return { createBookmark, deleteBookmark };
};
