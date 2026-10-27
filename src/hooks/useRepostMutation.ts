import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { repostApi } from '~/api';
import {
  getTargetQueryKeys,
  updateFeedEntityInCache,
  rollbackOptimisticUpdates,
} from '~/utils';

export const useRepostMutation = () => {
  const queryClient = useQueryClient();

  const updateRepostCache = (
    targetId: string,
    targetType: string,
    isRepost: boolean,
  ) => {
    const queryKeys = getTargetQueryKeys(targetType);
    return updateFeedEntityInCache(queryClient, queryKeys, item => {
      if (item.id !== targetId) return item;
      return {
        ...item,
        isReposted: isRepost,
        repostCount: isRepost
          ? (item.repostCount || 0) + 1
          : Math.max(0, (item.repostCount || 0) - 1),
      };
    });
  };

  const createRepost = useMutation({
    mutationFn: (params: { targetId: string; targetType: string }) => {
      if (!params.targetId || !params.targetType) {
        throw new Error('Missing create repost params');
      }
      return repostApi.createRepost(params);
    },
    onMutate: async params => {
      const previousDataMap = await updateRepostCache(
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
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi đăng lại nội dung';
      Alert.alert('Lỗi đăng lại nội dung', msg);
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.targetType) {
        const keys = getTargetQueryKeys(variables.targetType);
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
      queryClient.invalidateQueries({ queryKey: ['reposts'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const deleteRepost = useMutation({
    mutationFn: (params: { targetId: string; targetType: string }) => {
      if (!params.targetId || !params.targetType) {
        throw new Error('Missing delete repost params');
      }
      return repostApi.deleteRepost(params);
    },
    onMutate: async params => {
      const previousDataMap = await updateRepostCache(
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
        'Lỗi bỏ đăng lại nội dung';
      Alert.alert('Lỗi bỏ đăng lại nội dung', msg);
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.targetType) {
        const keys = getTargetQueryKeys(variables.targetType);
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
      queryClient.invalidateQueries({ queryKey: ['reposts'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  return { createRepost, deleteRepost };
};
