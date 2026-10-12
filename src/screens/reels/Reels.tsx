import { View, StyleSheet, Dimensions, ViewToken } from 'react-native';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import VideoReel from '~/components/reel/VideoReel';
import ImageReel from '~/components/reel/ImageReel';
import { IReel } from '~/interfaces/reel';
import { useInfiniteQuery } from '@tanstack/react-query';
import { reelApi } from '~/api';
import { useTheme, Theme } from '~/hooks';
import { useIsFocused } from '@react-navigation/native';
import { isVideoMedia } from '~/utils';

const Reels = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const isFocused = useIsFocused();
  const bottomTabHeight = useBottomTabBarHeight();
  const availableHeight = Dimensions.get('window').height - bottomTabHeight;
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['Reels'],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await reelApi.getAllReels(pageParam, 10);
        return response.data;
      },
      getNextPageParam: (lastPage: {
        pagination?: { page: number; totalPages: number };
        hasNextPage?: boolean;
        currentPage?: number;
      }) => {
        if (lastPage?.pagination) {
          return lastPage.pagination.page < lastPage.pagination.totalPages
            ? lastPage.pagination.page + 1
            : undefined;
        }
        return lastPage?.hasNextPage
          ? (lastPage?.currentPage || 1) + 1
          : undefined;
      },
      initialPageParam: 1,
    });

  const reels =
    data?.pages.flatMap(
      page => page.data || (page as { reels?: IReel[] }).reels || [],
    ) || [];

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems.length > 0 &&
        typeof viewableItems[0].index === 'number'
      ) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: IReel; index: number }) => {
      const mediaUrl = item.media?.url || item.videoUrl || item.mediaUrl || '';
      const isVideo = isVideoMedia(item.media || mediaUrl);

      return (
        <View style={[styles.reelItem, { height: availableHeight }]}>
          {isVideo ? (
            <VideoReel
              reel={item}
              isActive={index === activeIndex && isFocused}
            />
          ) : (
            <ImageReel reel={item} />
          )}
        </View>
      );
    },
    [styles.reelItem, availableHeight, activeIndex, isFocused],
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={reels}
        renderItem={renderItem}
        keyExtractor={item => item.id || ''}
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

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.black,
    },
    reelItem: {
      width: '100%',
    },
  });

export default Reels;
