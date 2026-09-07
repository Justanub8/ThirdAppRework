import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, useTheme, Theme } from '~/hooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CreateIcon, NotificationIcon } from '~/assets/svgs';
import { FastImage } from '~/components/rn-components';
import { images } from '~/assets/images';
import Story from '~/components/common/Story';
import Post from '~/components/post/Post';
import { SizedBox } from '~/components/separate-components';
import SlideUpModal from '~/components/slide-up/SlideUpModal';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '~/api/postApi';
import { FlashList } from '@shopify/flash-list';
import { Navigation } from '~/utils';

const HomeScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const menuModalRef = React.useRef<BottomSheetModal>(null);
  const [activePostId, setActivePostId] = React.useState<string | null>(null);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      setActivePostId(viewableItems[0].item.id || viewableItems[0].item._id);
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
      if (lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    }
  });
  
  const { logoutLocal } = useAuthStore();
  
  const posts = React.useMemo(() => data?.pages.flatMap(page => page.data) || [], [data?.pages]);

  const renderHeader = React.useCallback(() => (
    <View>
      <View style={styles.topHeader}>
          <CreateIcon width={36} height={36} onPress={() => { Navigation.goToCreateContent(); }}/>
          <FastImage source={images.logo_transparent} resizeMode='contain' style={styles.logo}/>
          <NotificationIcon width={32} height={32} onPress={() => { logoutLocal(); }}/>
      </View>
      <Story username='justanub'/>
      <SizedBox height={24}/>
    </View>
  ), [logoutLocal]);

  const keyExtractor = React.useCallback((item: any) => item.id || item._id, []);

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => (
      <Post post={item} isActive={(item.id || item._id) === activePostId} />
    ),
    [activePostId]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <FlashList 
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" /> : null}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <SlideUpModal
        ref={menuModalRef}
        renderComponent={<View></View>}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  logo: {
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
    alignItems: 'center',
  },
  headerModal: {
    borderBottomColor: theme.divider,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerComponent: {
    borderWidth: 1,
    borderColor: theme.border,
    height: 50,
  },
});

export default HomeScreen;