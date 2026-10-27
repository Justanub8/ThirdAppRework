import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { likeApi } from '~/api';
import {
  getTargetQueryKeys,
  updateFeedEntityInCache,
  rollbackOptimisticUpdates,
} from '~/utils';

export const useLikeMutation = () => {
  const queryClient = useQueryClient();

  const updateLikeCache = (
    targetId: string,
    targetType: string,
    isLike: boolean,
  ) => {
    const baseQueryKeys = getTargetQueryKeys(targetType);
    return updateFeedEntityInCache(queryClient, baseQueryKeys, item => {
      if (item.id !== targetId) return item;
      return {
        ...item,
        isLiked: isLike,
        likeCount: isLike
          ? (item.likeCount || 0) + 1
          : Math.max(0, (item.likeCount || 0) - 1),
      };
    });
  };

  const createLike = useMutation({
    mutationFn: (params: { targetId: string; targetType: string }) => {
      if (!params.targetId || !params.targetType) {
        throw new Error('Missing create like params');
      }
      return likeApi.createLike(params);
    },
    onMutate: async params => {
      const previousDataMap = await updateLikeCache(
        params.targetId,
        params.targetType,
        true,
      );
      return { previousDataMap, targetType: params.targetType };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDataMap) {
        rollbackOptimisticUpdates(queryClient, context.previousDataMap);
      }
      Alert.alert('Lỗi thích nội dung');
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.targetType) {
        const keys = getTargetQueryKeys(variables.targetType);
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });

  const deleteLike = useMutation({
    mutationFn: (params: { targetId: string; targetType: string }) => {
      if (!params.targetId || !params.targetType) {
        throw new Error('Missing delete like params');
      }
      return likeApi.deleteLike(params);
    },
    onMutate: async params => {
      const previousDataMap = await updateLikeCache(
        params.targetId,
        params.targetType,
        false,
      );
      return { previousDataMap, targetType: params.targetType };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDataMap) {
        rollbackOptimisticUpdates(queryClient, context.previousDataMap);
      }
      Alert.alert('Lỗi bỏ thích nội dung');
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.targetType) {
        const keys = getTargetQueryKeys(variables.targetType);
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });

  return { createLike, deleteLike };
};
