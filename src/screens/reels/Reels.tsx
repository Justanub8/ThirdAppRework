import { View, StyleSheet, Dimensions } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import { commonStyles } from '~/constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import VideoReel from '~/components/reel/VideoReel'
import ImageReel from '~/components/reel/ImageReel'
import { IReel } from '~/interfaces/reel'
import { useQuery } from '@tanstack/react-query'
// TODO: Replace this with your actual API fetcher for reels
// import { getReels } from '~/api/reelsApi'

// Dummy DATA until API is integrated
const DUMMY_REELS: Partial<IReel>[] = [
  {
    _id: '1',
    media: { url: 'https://vjs.zencdn.net/v/oceans.mp4', type: 'video' } as any,
    likeCount: 1234,
    commentCount: 56,
    shareCount: 12,
    repostCount: 5,
    caption: 'Great ocean view!',
    user: { username: '_ocean_lover' } as any,
  },
  {
    _id: '2',
    media: { url: 'https://images.unsplash.com/photo-1506744626753-edaeb5d8c56a?q=80&w=1080&auto=format&fit=crop', type: 'image' } as any,
    likeCount: 550,
    commentCount: 23,
    shareCount: 1,
    repostCount: 0,
    caption: 'Beautiful landscape photography.',
    user: { username: '_photo_grapher' } as any,
  },
  {
    _id: '3',
    media: { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'video' } as any,
    likeCount: 9999,
    commentCount: 100,
    shareCount: 50,
    repostCount: 20,
    caption: 'Big Buck Bunny!',
    user: { username: 'blender_foundation' } as any,
  }
];

const Reels = () => {
  const bottomTabHeight = useBottomTabBarHeight();
  const availableHeight = Dimensions.get('window').height - bottomTabHeight;
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch reels (uncomment and adjust when API is ready)
  // const { data: reels = DUMMY_REELS } = useQuery({ queryKey: ['Reel'], queryFn: getReels });
  const reels = DUMMY_REELS as IReel[];

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
      />
    </View>
  )
}

export default Reels