import React from 'react';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SizedBox } from '../separate-components';
import { PrimaryInput } from '../inputs';
import { BaseText } from '../rn-components';
import { Avatar } from '../avatar';
import { images } from '~/assets/images';
import { useInfiniteQuery } from '@tanstack/react-query';
import { commentApi } from '~/api/commentApi';
import { FlashList } from '@shopify/flash-list';
import Comment from '../comment/Comment';
import { useCommentMutation, useTheme, Theme, useAuthStore } from '~/hooks';
import { Typography } from '~/constants';

const CommentSheet = (props: SheetProps<"CommentSheet">) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const currentUser = useAuthStore(state => state.user);
  const { targetId, targetType } = props.payload || {};
  const [commentText, setCommentText] = React.useState('');
  const { createComment } = useCommentMutation();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['comments', targetId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!targetId) return { data: [], pagination: { totalPages: 1, page: 1 } };
      const res = await commentApi.getCommentsByTarget(targetId, pageParam, 20);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!targetId
  });

  const handleSendComment = () => {
    if (!commentText.trim() || !targetId || !targetType) return;
    createComment.mutate(
      { targetId, targetType, content: commentText },
      {
        onSuccess: () => {
          setCommentText('');
        }
      }
    );
  };

  const comments = data?.pages.flatMap(page => page.data) || [];

  return (
    <ActionSheet 
      id={props.sheetId} 
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      indicatorStyle={styles.indicator}
      containerStyle={styles.containerStyle}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <BaseText style={styles.title}>Bình luận</BaseText>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ flex: 1 }}>
            <FlashList
              data={comments}
              renderItem={({ item }) => <Comment item={item} />}
              keyExtractor={(item: any) => item.id || ''}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
                  <BaseText style={{ color: theme.placeholder }}>Chưa có bình luận nào</BaseText>
                  <SizedBox height={6} />
                  <BaseText typography={Typography.bodyRegular.small} style={{ color: theme.placeholder }}>Hãy là người đầu tiên bình luận!</BaseText>
                </View>
              }
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" /> : null}
            />
          </View>
        )}
        <View style={styles.inputBar}>
          <SizedBox height={12}/>
          <View style={styles.inputRow}>
            <Avatar 
              url={currentUser?.avatarUrl || currentUser?.imageUrl} 
              size={48} 
              disabled 
            />
            <View style={styles.inputWrapper}>
              <PrimaryInput 
                placeholder='Tham gia cuộc trò chuyện...'
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleSendComment}
                returnKeyType="send"
              />
            </View>
          </View>
          <SizedBox height={12}/>
        </View>
      </View>
    </ActionSheet>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  containerStyle: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: theme.sheet,
  },
  indicator: {
    width: 44,
    height: 5,
    backgroundColor: theme.placeholder,
    borderRadius: 3,
    marginTop: 8,
  },
  header: {
    borderBottomColor: theme.divider,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 6,
    textAlign: 'center',
  },
  inputBar: {
    backgroundColor: theme.sheet,
    borderTopColor: theme.divider,
    borderTopWidth: 1,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
});

export default CommentSheet;
