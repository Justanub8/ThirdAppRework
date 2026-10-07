import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { TabView, SceneRendererProps } from 'react-native-tab-view';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import GridContent from '~/components/item/GridContent';
import { useTheme, useAuthStore, Theme } from '~/hooks';
import { Typography } from '~/constants';
import { BaseText } from '~/components/rn-components';
import {
  GridIcon,
  ReelBoldIcon,
  ReelLightIcon,
  RepostIcon,
  BookmarkBoldIcon,
  BookmarkLightIcon,
} from '~/assets/svgs';
import { postApi, reelApi, repostApi, shareApi } from '~/api';
import { IPost, IReel, IRepost, IShare, IBookmark } from '~/interfaces';

type TabType = 'posts' | 'reels' | 'reposts' | 'shares';
type TabItem = IPost | IReel | IRepost | IShare | IBookmark | (Record<string, unknown> & { id?: string; media?: unknown; target?: unknown; videoUrl?: string });

type Route = {
  key: TabType;
  title: string;
};

const extractMedia = (item: any, type: TabType) => {
  if (!item) return null;

  if (type === 'reels') {
    const media = Array.isArray(item.media) ? item.media[0] : item.media;
    const uri = media?.url || item.videoUrl;
    return uri ? { uri, mediaType: media?.type || 'video' } : null;
  }

  if (type === 'posts') {
    const media = Array.isArray(item.media) ? item.media[0] : item.media;
    const uri = media?.url;
    return uri ? { uri, mediaType: media?.type || 'image' } : null;
  }

  // reposts & shares
  const target = item.target || item;
  const targetMedia = Array.isArray(target?.media)
    ? target.media[0]
    : target?.media;
  const directMedia = Array.isArray(item?.media) ? item.media[0] : item?.media;
  const media = targetMedia || directMedia;

  const uri = media?.url || target?.videoUrl || item.videoUrl;
  if (!uri) return null;

  const isVideo =
    media?.type === 'video' ||
    (item.targetType || '').toLowerCase() === 'reel' ||
    (target.targetType || '').toLowerCase() === 'reel';

  return {
    uri,
    mediaType: isVideo ? 'video' : 'image',
  };
};

const getEmptyMessage = (type: TabType) => {
  switch (type) {
    case 'posts':
      return 'Chưa có bài viết nào';
    case 'reels':
      return 'Chưa có thước phim nào';
    case 'reposts':
      return 'Chưa có bài chia sẻ lại';
    case 'shares':
      return 'Chưa có nội dung chia sẻ';
    default:
      return 'Không có nội dung';
  }
};

interface TabContentProps {
  type: TabType;
  id?: string;
  theme: Theme;
}

const TabContent: React.FC<TabContentProps> = ({ type, id, theme }) => {
  const styles = useMemo(() => getStyles(theme), [theme]);

  const {
    data = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [`user-${type}`, id],
    queryFn: async () => {
      if (!id) return [];
      switch (type) {
        case 'posts': {
          const res = await postApi.getAllPosts(1, 30, id);
          return res?.data?.data || [];
        }
        case 'reels': {
          const res = await reelApi.getAllReels(1, 30, id);
          return res?.data?.data || (res?.data as { reels?: IReel[] })?.reels || [];
        }
        case 'reposts': {
          const res = await repostApi.getUserReposts(1, 30, undefined, id);
          return res?.data?.data || [];
        }
        case 'shares': {
          const res = await shareApi.getUserShares(1, 30, undefined, id);
          return res?.data?.data || [];
        }
        default:
          return [];
      }
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={styles.tabContentContainer}>
      <FlashList
        data={data}
        numColumns={3}
        contentContainerStyle={styles.flashListContent}
        keyExtractor={(item: TabItem, index: number) =>
          item?.id ? `${type}-${item.id}` : `${type}-${index}`
        }
        renderItem={({ item }: { item: TabItem }) => {
          const media = extractMedia(item, type);
          if (!media?.uri) return null;
          return (
            <GridContent
              uri={media.uri}
              mediaType={media.mediaType}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BaseText
              color={theme.placeholder}
              typography={Typography.bodyRegular.medium}
            >
              {getEmptyMessage(type)}
            </BaseText>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.text}
          />
        }
      />
    </View>
  );
};

export function PostTab({ id }: { id?: string }) {
  const { theme } = useTheme();
  return <TabContent type="posts" id={id} theme={theme} />;
}

export function ReelTab({ id }: { id?: string }) {
  const { theme } = useTheme();
  return <TabContent type="reels" id={id} theme={theme} />;
}

export function RepostTab({ id }: { id?: string }) {
  const { theme } = useTheme();
  return <TabContent type="reposts" id={id} theme={theme} />;
}

export function ShareTab({ id }: { id?: string }) {
  const { theme } = useTheme();
  return <TabContent type="shares" id={id} theme={theme} />;
}

const renderTabIcon = (key: TabType, isFocused: boolean, color: string) => {
  switch (key) {
    case 'posts':
      return <GridIcon width={22} height={22} color={color} />;
    case 'reels':
      return isFocused ? (
        <ReelBoldIcon width={22} height={22} color={color} />
      ) : (
        <ReelLightIcon width={22} height={22} color={color} />
      );
    case 'reposts':
      return <RepostIcon width={22} height={22} color={color} />;
    case 'shares':
      return isFocused ? (
        <BookmarkBoldIcon width={22} height={22} color={color} />
      ) : (
        <BookmarkLightIcon width={22} height={22} color={color} />
      );
    default:
      return null;
  }
};

export interface TabsProps {
  id?: string;
  style?: StyleProp<ViewStyle>;
}

const Tabs: React.FC<TabsProps> = ({ id: propId, style }) => {
  const currentUser = useAuthStore((state) => state.user);
  const id = propId || currentUser?.id || '';
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [index, setIndex] = useState(0);

  const [routes] = useState<Route[]>([
    { key: 'posts', title: 'Post' },
    { key: 'reels', title: 'Reel' },
    { key: 'reposts', title: 'Repost' },
    { key: 'shares', title: 'Share' },
  ]);

  const renderScene = useCallback(
    ({ route }: SceneRendererProps & { route: Route }) => {
      switch (route.key) {
        case 'posts':
          return <PostTab id={id} />;
        case 'reels':
          return <ReelTab id={id} />;
        case 'reposts':
          return <RepostTab id={id} />;
        case 'shares':
          return <ShareTab id={id} />;
        default:
          return null;
      }
    },
    [id]
  );

  const renderTabBar = useCallback(
    (props: SceneRendererProps & { navigationState: { index: number; routes: Route[] } }) => {
      return (
        <View style={styles.tabBar}>
          {props.navigationState.routes.map((route: Route, i: number) => {
            const isFocused = props.navigationState.index === i;
            const color = isFocused ? theme.text : theme.placeholder;

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                onPress={() => props.jumpTo(route.key)}
                style={[
                  styles.tabItem,
                  isFocused && styles.activeTabItem,
                ]}
              >
                {renderTabIcon(route.key, isFocused, color)}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    },
    [styles, theme]
  );

  return (
    <View style={[styles.container, style]}>
      <TabView
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        initialLayout={{ width: SCREEN_WIDTH }}
        lazy
      />
    </View>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      minHeight: SCREEN_HEIGHT * 0.7,
      backgroundColor: theme.background,
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 0.5,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTabItem: {
      borderBottomColor: theme.text,
    },
    tabContentContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      minHeight: 200,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyContainer: {
      flex: 1,
      minHeight: 200,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    flashListContent: {
      paddingBottom: 24,
    },
  });

export default Tabs;