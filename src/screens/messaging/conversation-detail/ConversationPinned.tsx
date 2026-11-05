import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Theme } from '~/hooks';
import { IMessage } from '~/interfaces';
import { messageApi } from '~/api';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Avatar, BaseText, CustomHeader } from '~/components';
import { ArrowToLeft } from '~/assets/svgs';
import { Typography } from '~/constants';
import { Navigation } from '~/utils';
import dayjs from 'dayjs';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'ConversationPinned'>;

const ConversationPinned = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const route = useRoute<RouteProps>();
  const id = route.params?.id;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isFull, setIsFull] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const messageRef = useRef<IMessage[]>(messages);
  useEffect(() => {
    messageRef.current = messages;
  }, [messages]);

  const fetchData = useCallback(
    async (
      page: number,
      isLoadMore: boolean,
      isRefreshingFlag: boolean = false,
    ) => {
      if (!id) return;
      try {
        if (isLoadMore) {
          setIsFetchingNextPage(true);
        } else if (isRefreshingFlag) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const res = await messageApi.getMessages(id, page, 20, 'Pinned');
        const resultData = res.data as any;
        const rawMessages: IMessage[] = Array.isArray(resultData)
          ? resultData
          : resultData?.data || resultData?.items || [];

        if (isLoadMore) {
          setMessages(prev => [...prev, ...rawMessages]);
        } else {
          setMessages(rawMessages);
        }
        setPageIndex(page);

        const currentTotal =
          (isLoadMore ? messageRef.current.length : 0) + rawMessages.length;
        const totalRecord = Array.isArray(resultData)
          ? resultData.length
          : resultData?.pagination?.total ?? rawMessages.length;

        setIsFull(currentTotal >= totalRecord || rawMessages.length < 20);
      } catch (error) {
        console.error('Lỗi lấy danh sách tin nhắn đã ghim:', error);
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
        setIsRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (id) {
      fetchData(1, false, false);
    }
  }, [id, fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(1, false, true);
  }, [fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!isFull && !isFetchingNextPage && !isLoading) {
      fetchData(pageIndex + 1, true, false);
    }
  }, [isFull, isFetchingNextPage, isLoading, pageIndex, fetchData]);

  const renderItem = useCallback(
    ({ item }: { item: IMessage }) => {
      const sender = item.sender;
      const senderName = sender?.name || sender?.username || 'Người dùng';
      const senderAvatar = sender?.avatarUrl;
      const formattedTime = dayjs(item.createdAt).format('HH:mm DD/MM/YYYY');

      return (
        <View style={styles.messageItem}>
          <Avatar url={senderAvatar} size={40} disabled />
          <View style={styles.messageContentWrapper}>
            <View style={styles.messageHeader}>
              <BaseText typography={Typography.bodyRegular.small} numberOfLines={1}>
                {senderName}
              </BaseText>
              <BaseText typography={Typography.bodyRegular.xSmall} color={theme.subtext}>
                {formattedTime}
              </BaseText>
            </View>

            <View style={styles.bubble}>
              <BaseText typography={Typography.bodyRegular.medium} color={theme.text}>
                {item.content || '(Tin nhắn trống)'}
              </BaseText>
            </View>
          </View>
        </View>
      );
    },
    [styles, theme.errorRed, theme.subtext, theme.text],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.primaryBlue} />
      </View>
    );
  }, [isFetchingNextPage, styles.loadingFooter, theme.primaryBlue]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={theme.primaryBlue} />
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <BaseText typography={Typography.bodyRegular.medium} color={theme.subtext}>
          Chưa có tin nhắn nào được ghim
        </BaseText>
      </View>
    );
  }, [isLoading, styles.centerContainer, theme.primaryBlue, theme.subtext]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <CustomHeader
        title="Tin nhắn đã ghim"
        LeftComponent={
          <TouchableOpacity
            onPress={() => Navigation.pop()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowToLeft height={24} width={24} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id || `${item.createdAt}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primaryBlue}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    messageItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.divider || 'rgba(255, 255, 255, 0.1)',
    },
    messageContentWrapper: {
      flex: 1,
      marginHorizontal: 12,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    bubble: {
      backgroundColor: theme.darkCard || 'rgba(255, 255, 255, 0.05)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      marginTop: 2,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingFooter: {
      paddingVertical: 16,
      alignItems: 'center',
    },
  });

export default ConversationPinned;