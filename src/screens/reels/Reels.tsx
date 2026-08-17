import { View, StyleSheet, Dimensions } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import { commonStyles } from '~/constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import VideoReel from '~/components/reel/VideoReel'
import ImageReel from '~/components/reel/ImageReel'
import { IReel } from '~/interfaces/reel'
import { useInfiniteQuery } from '@tanstack/react-query'
import { reelApi } from '~/api'


const Reels = () => {
  const bottomTabHeight = useBottomTabBarHeight();
  const availableHeight = Dimensions.get('window').height - bottomTabHeight;
  const [activeIndex, setActiveIndex] = useState(0);


  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({ 
    queryKey: ['Reels'], 
    queryFn: async ({ pageParam = 1 }) => {
      const response = await reelApi.getAllReels(pageParam, 10);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const reels = data?.pages.flatMap((page) => page.reels) || [];

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const renderItem = ({ item, index }: { item: IReel, index: number }) => {
    return (
      <View style={{ height: availableHeight, width: '100%' }}>
        {item.media?.type === 'video' ? (
          <VideoReel reel={item} isActive={index === activeIndex} />
        ) : (
          <ImageReel reel={item} />
        )}
      </View>
    );
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: '#000' }]}>
      <FlashList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
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
  )
}

export default Reels