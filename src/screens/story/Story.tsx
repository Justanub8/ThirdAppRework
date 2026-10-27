import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storyApi, viewApi, messageApi } from '~/api';
import { useLikeMutation } from '~/hooks';
import { Navigation } from '~/utils';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { IStory, IProfileUser } from '~/interfaces';
import StoryViewer from './components/StoryViewer';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'Story'>;

const Story = () => {
  const route = useRoute<RouteProps>();
  const { userId, userIds: initialUserIds } = route.params;

  const userIds = useMemo(() => {
    if (initialUserIds && initialUserIds.length > 0) {
      return initialUserIds;
    }
    return userId ? [userId] : [];
  }, [initialUserIds, userId]);

  const [currentUserIndex, setCurrentUserIndex] = useState(() => {
    const idx = userIds.indexOf(userId);
    return idx !== -1 ? idx : 0;
  });

  const activeUserId = userIds[currentUserIndex] || userId;
  const { createLike, deleteLike } = useLikeMutation();
  const queryClient = useQueryClient();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['story', activeUserId],
    queryFn: async () => {
      const response = await storyApi.getAllStories(1, 20, activeUserId);
      return response.data?.data || [];
    },
    enabled: !!activeUserId,
    staleTime: 5 * 60 * 1000,
  });

  const nextUserId = userIds[currentUserIndex + 1];

  useEffect(() => {
    if (nextUserId) {
      queryClient.prefetchQuery({
        queryKey: ['story', nextUserId],
        queryFn: async () => {
          const res = await storyApi.getAllStories(1, 20, nextUserId);
          return res.data?.data || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [nextUserId, queryClient]);

  const currentStory = stories[activeIndex];
  const isCurrentStoryLiked = Boolean(currentStory?.isLiked);

  const handleStoryViewed = useCallback(
    (story: IStory) => {
      if (!story?.id || story.isViewed) return;

      queryClient.setQueryData(
        ['story', activeUserId],
        (old: IStory[] | undefined) => {
          if (!Array.isArray(old)) return old;
          const updated = old.map((item: IStory) =>
            item.id === story.id
              ? {
                  ...item,
                  isViewed: true,
                  viewCount: (item.viewCount || 0) + 1,
                }
              : item,
          );
          const allViewed =
            updated.length > 0 && updated.every((s: IStory) => s.isViewed);
          if (allViewed) {
            queryClient.setQueryData(
              ['userProfile', activeUserId],
              (oldProfile: IProfileUser | undefined) => {
                if (!oldProfile) return oldProfile;
                return { ...oldProfile, isSeenStory: true };
              },
            );
            queryClient.setQueryData(
              ['followedStories'],
              (oldStories: IProfileUser[] | undefined) => {
                if (!Array.isArray(oldStories)) return oldStories;
                return oldStories.map((u: IProfileUser) =>
                  u.id === activeUserId ? { ...u, isSeenStory: true } : u,
                );
              },
            );
          }
          return updated;
        },
      );

      viewApi
        .createView({ targetId: story.id, targetType: 'Story' })
        .catch(() => {});
    },
    [activeUserId, queryClient],
  );

  const handleToggleLike = useCallback(() => {
    if (!currentStory?.id) return;
    if (currentStory.isLiked) {
      deleteLike.mutate({ targetId: currentStory.id, targetType: 'Story' });
    } else {
      createLike.mutate({ targetId: currentStory.id, targetType: 'Story' });
    }
  }, [currentStory, createLike, deleteLike]);

  const handleNextUser = useCallback(() => {
    if (currentUserIndex < userIds.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setActiveIndex(0);
    } else {
      Navigation.goBack();
    }
  }, [currentUserIndex, userIds.length]);

  const handlePrevUser = useCallback(() => {
    if (currentUserIndex > 0) {
      const prevIndex = currentUserIndex - 1;
      const targetPrevUserId = userIds[prevIndex];
      const cached = queryClient.getQueryData<IStory[]>([
        'story',
        targetPrevUserId,
      ]);
      const lastStoryIdx =
        Array.isArray(cached) && cached.length > 0 ? cached.length - 1 : 0;
      setCurrentUserIndex(prevIndex);
      setActiveIndex(lastStoryIdx);
    } else {
      Navigation.goBack();
    }
  }, [currentUserIndex, userIds, queryClient]);

  const handleSendReply = useCallback(
    async (content: string) => {
      if (!activeUserId) return;
      try {
        await messageApi.sendMessage({
          content,
          targetStoryId: currentStory?.id,
        } as any);
      } catch (err) {
        console.error('Lỗi gửi tin nhắn phản hồi story:', err);
      }
    },
    [activeUserId, currentStory?.id],
  );

  return (
    <StoryViewer
      stories={stories}
      isLoading={isLoading}
      isOwnStory={false}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      onClose={() => Navigation.goBack()}
      onNextUser={handleNextUser}
      onPrevUser={handlePrevUser}
      isLiked={isCurrentStoryLiked}
      onToggleLike={handleToggleLike}
      onStoryViewed={handleStoryViewed}
      onSendReply={handleSendReply}
    />
  );
};

export default Story;
