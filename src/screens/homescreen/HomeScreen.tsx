import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native'
import * as React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '~/hooks'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { CreateIcon, NotificationIcon } from '~/assets/svgs'
import { commonStyles } from '~/constants'
import { FastImage } from '~/components/rn-components'
import { images } from '~/assets/images'
import Story from '~/components/story/Story'
import Post from '~/components/post/Post'
import { SizedBox } from '~/components/separate-components'
import { PrimaryInput } from '~/components/inputs'
import Comment from '~/components/comment/Comment'
import SlideUpModal from '~/components/slide-up/SlideUpModal'
import { useInfiniteQuery } from '@tanstack/react-query'
import { postApi } from '~/api/postApi'
import { SheetManager } from 'react-native-actions-sheet'
import { FlashList } from '@shopify/flash-list'

const HomeScreen = () => {
  const menuModalRef = React.useRef<BottomSheetModal>(null);
  const [activePostId, setActivePostId] = React.useState<string | null>(null);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      setActivePostId(viewableItems[0].item._id);
    }
  }, []);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['Post'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await postApi.getAllPosts(pageParam, 10);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    }
  });
  
  const {logoutLocal} = useAuthStore();
  
  const posts = data?.pages.flatMap(page => page.data) || [];

  const renderHeader = () => (
    <View>
      <View style= {[commonStyles.flexRow, commonStyles.justifyBetween, commonStyles.alignItemsCenter, commonStyles.paddingScrollHorizontal, commonStyles.testBorder]}>
          <CreateIcon width={36} height={36} onPress={() => {}}/>
          <FastImage source={images.logo_transparent} resizeMode='contain' style={styles.logo}/>
          <NotificationIcon width={32} height={32} onPress={() => {logoutLocal()}}/>
      </View>
      <Story username='justanub'/>
      <SizedBox height={24}/>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style = {[commonStyles.container]}>
      <FlashList 
        data={posts}
        renderItem={({ item }) => <Post post={item} isActive={item._id === activePostId} />}
        keyExtractor={(item: any) => item._id}
        ListHeaderComponent={renderHeader}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" /> : null}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        estimatedItemSize={600}
      />
      <SlideUpModal
        ref={menuModalRef}
        renderComponent={<View></View>}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  logo:{
    width: 120,
    height: 60,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerModal: {
    borderBottomColor: '#bdbdbd',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerComponent: {
    borderWidth: 1,
    borderColor: '#000000',
    height: 50,
  }
})

export default HomeScreen