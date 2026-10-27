import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { storyApi } from '~/api';
import { useAuthStore } from '~/store';
import { Navigation } from '~/utils';
import StoryViewer from './components/StoryViewer';

const MyActiveStory = () => {
  const { user } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const {
    data: stories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-story'],
    queryFn: async () => {
      const res = await storyApi.getAllStories(1, 20, user?.id);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <StoryViewer
      stories={stories}
      isLoading={isLoading}
      isOwnStory={true}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      onClose={() => Navigation.goBack()}
    />
  );
};

export default MyActiveStory;
