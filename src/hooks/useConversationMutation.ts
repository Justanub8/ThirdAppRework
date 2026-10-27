import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { conversationApi } from '~/api';

export const useConversationMutation = () => {
  const queryClient = useQueryClient();
  const createConversation = useMutation({
    mutationFn: (targetId: string) => {
      if (!targetId) {
        throw new Error('Missing conversation params');
      }
      return conversationApi.createConversation(targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      Alert.alert('Lỗi khi tạo cuộc trò chuyện');
    },
  });
  const createGroupConversation = useMutation({
    mutationFn: (participantIds: string[]) => {
      if (!participantIds || participantIds.length < 2) {
        throw new Error('Nhóm chat cần chọn ít nhất 2 thành viên khác');
      }
      return conversationApi.createGroupConversation(participantIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi khi tạo nhóm chat';
      Alert.alert('Lỗi', message);
    },
  });

  const updateGroup = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; avatarUrl?: string };
    }) => {
      if (!id) {
        throw new Error('Thiếu ID cuộc trò chuyện');
      }
      return conversationApi.updateGroup(id, data);
    },
    onSuccess: (res, variables) => {
      const updatedData = res?.data?.data;
      if (updatedData) {
        queryClient.setQueryData(
          ['conversation', variables.id],
          (old: any) => ({
            ...old,
            ...updatedData,
          }),
        );
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.id],
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi khi cập nhật thông tin nhóm';
      Alert.alert('Lỗi', message);
    },
  });

  const updateMemberNickname = useMutation({
    mutationFn: ({
      conversationId,
      targetUserId,
      nickname,
    }: {
      conversationId: string;
      targetUserId: string;
      nickname?: string;
    }) => {
      if (!conversationId || !targetUserId) {
        throw new Error('Thiếu thông tin cuộc trò chuyện hoặc thành viên');
      }
      return conversationApi.updateMemberNickname(
        conversationId,
        targetUserId,
        nickname,
      );
    },
    onSuccess: (res, variables) => {
      const updatedMember = res?.data?.data;
      if (updatedMember) {
        queryClient.setQueryData(
          ['conversation', variables.conversationId],
          (old: any) => {
            if (!old) return old;
            const updatedMembers = (old.members || []).map((m: any) =>
              m.userId === variables.targetUserId
                ? { ...m, ...updatedMember }
                : m,
            );
            return {
              ...old,
              ...(!old.isGroup && { nickname: updatedMember.nickname || null }),
              members: updatedMembers,
            };
          },
        );
      }
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi khi cập nhật biệt danh';
      Alert.alert('Lỗi', message);
    },
  });

  return {
    createConversation,
    createGroupConversation,
    updateGroup,
    updateMemberNickname,
  };
};
