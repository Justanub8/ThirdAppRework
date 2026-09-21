import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, useTheme, Theme } from '~/hooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CreateIcon, NotificationIcon } from '~/assets/svgs';
import { FastImage } from '~/components/rn-components';
import { images } from '~/assets/images';
import { Avatar } from '~/components/avatar';
import Post from '~/components/post/Post';
import { SizedBox } from '~/components/separate-components';
import SlideUpModal from '~/components/slide-up/SlideUpModal';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { postApi } from '~/api/postApi';
import { userApi } from '~/api/userApi';
import { FlashList } from '@shopify/flash-list';
import { Navigation } from '~/utils';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const menuModalRef = React.useRef<BottomSheetModal>(null);
  const [activePostId, setActivePostId] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      setActivePostId(viewableItems[0].item.id);
    }
  }, []);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch: refetchPosts } = useInfiniteQuery({
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

  const { data: myProfile, refetch: refetchMyProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await userApi.getMyProfile();
      return res.data?.user;
    },
    staleTime: 30 * 1000,
  });

  const { data: followedStories = [], refetch: refetchFollowedStories } = useQuery({
    queryKey: ['followedStories'],
    queryFn: async () => {
      const res = await userApi.getFollowedUser(1, 20);
      return res.data?.users || [];
    },
    staleTime: 60 * 1000,
  });

  const { user: currentUser, logoutLocal } = useAuthStore();

  useFocusEffect(
    React.useCallback(() => {
      refetchMyProfile();
      refetchFollowedStories();
    }, [refetchMyProfile, refetchFollowedStories])
  );

  React.useEffect(() => {
    if (myProfile && currentUser && currentUser.hasActiveStory !== myProfile.hasActiveStory) {
      useAuthStore.getState().updateUser({
        ...currentUser,
        hasActiveStory: myProfile.hasActiveStory,
      });
    }
  }, [myProfile, currentUser]);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchPosts(),
      refetchMyProfile(),
      refetchFollowedStories(),
    ]);
    setIsRefreshing(false);
  }, [refetchPosts, refetchMyProfile, refetchFollowedStories]);
  
  const posts = React.useMemo(() => data?.pages.flatMap(page => page.data) || [], [data?.pages]);

  const effectiveUser = myProfile || currentUser;
  const hasActiveStory = Boolean(myProfile?.hasActiveStory ?? currentUser?.hasActiveStory);
  const isSeenStory = Boolean(myProfile?.isSeenStory);

  const renderHeader = React.useCallback(() => (
    <View>
      <View style={styles.topHeader}>
          <CreateIcon width={36} height={36} onPress={() => { Navigation.goToCameraScreen();}}/>
          <FastImage source={images.logo_transparent} resizeMode='contain' style={styles.logo}/>
          <NotificationIcon width={32} height={32} onPress={() => { logoutLocal(); }}/>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, gap: 14 }}
      >
        <Avatar 
          url={effectiveUser?.avatarUrl || effectiveUser?.imageUrl}
          username={'Tin của bạn'} 
          size={76} 
          hasActiveStory={hasActiveStory} 
          isSeenStory={isSeenStory}
          id={effectiveUser?.id || currentUser?.id || ''}
          onPress={() => {
            if (hasActiveStory) {
              Navigation.goToMyActiveStory();
            } else {
              Navigation.goToCameraScreen();
            }
          }}
        />
        {followedStories.map((u: any) => (
          <Avatar
            key={u.id}
            url={u.avatarUrl || u.imageUrl}
            username={u.username}
            size={76}
            hasActiveStory={true}
            isSeenStory={u.isSeenStory}
            id={u.id}
            storyUserIds={followedStories.map((item: any) => item.id)}
          />
        ))}
      </ScrollView>
      <SizedBox height={16}/>
    </View>
  ), [effectiveUser, currentUser, hasActiveStory, isSeenStory, logoutLocal, followedStories, styles]);

  const keyExtractor = React.useCallback((item: any) => item.id, []);

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => (
      <Post post={item} isActive={item.id === activePostId} />
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
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        extraData={[hasActiveStory, isSeenStory, followedStories]}
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