import { View, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import VideoReel from '~/components/reel/VideoReel';
import ImageReel from '~/components/reel/ImageReel';
import { IReel } from '~/interfaces/reel';
import { useInfiniteQuery } from '@tanstack/react-query';
import { reelApi } from '~/api';
import { useTheme } from '~/hooks';
import { useIsFocused } from '@react-navigation/native';

const Reels = () => {
  const { theme } = useTheme();
  const isFocused = useIsFocused();
  const bottomTabHeight = useBottomTabBarHeight();
  const availableHeight = Dimensions.get('window').height - bottomTabHeight;
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({ 
    queryKey: ['Reels'], 
    queryFn: async ({ pageParam = 1 }) => {
      const response = await reelApi.getAllReels(pageParam, 10);
      return response.data;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.pagination) {
        return lastPage.pagination.page < lastPage.pagination.totalPages
          ? lastPage.pagination.page + 1
          : undefined;
      }
      return lastPage?.hasNextPage ? (lastPage?.currentPage || 1) + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const reels = data?.pages.flatMap((page: any) => page.data || page.reels || []) || [];

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const renderItem = useCallback(({ item, index }: { item: IReel, index: number }) => {
    const mediaUrl = item.media?.url || (item as any).videoUrl || (item as any).mediaUrl || '';
    const isVideo =
      item.media?.type === 'video' ||
      /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(mediaUrl);

    return (
      <View style={{ height: availableHeight, width: '100%' }}>
        {isVideo ? (
          <VideoReel reel={item} isActive={index === activeIndex && isFocused} />
        ) : (
          <ImageReel reel={item} />
        )}
      </View>
    );
  }, [availableHeight, activeIndex, isFocused]);

  return (
    <View style={[styles.container, { backgroundColor: theme.black }]}>
      <FlashList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || ''}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Reels;