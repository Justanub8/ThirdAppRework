import React, { useState} from 'react';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { View, Text, StyleSheet } from 'react-native';
import { SizedBox } from '../separate-components';
import { PrimaryInput } from '../inputs';
import { FastImage } from '../rn-components';
import { COLORS, commonStyles } from '~/constants';
import { images } from '~/assets/images';
import { useInfiniteQuery } from '@tanstack/react-query';
import { commentApi } from '~/api/commentApi';
import { FlashList } from '@shopify/flash-list';
import Comment from '../comment/Comment';
import { ActivityIndicator, Alert } from 'react-native';
import { useCommentMutation } from '~/hooks';

const CommentSheet = (props: SheetProps<"CommentSheet">) => {
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
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!targetId
  });

  

  const handleSendComment = () => {
    if (!commentText.trim() || !targetId || !targetType) return;
    createComment.mutate(
      {targetId, targetType, content: commentText},
      {
        onSuccess: () => {
          setCommentText('');
        }
      }
    );
  };

  const comments = data?.pages.flatMap(page => page.data) || [];
  console.log("COMMENTS IN SHEET:", JSON.stringify(comments, null, 2));

  return (
    <ActionSheet 
      id={props.sheetId} 
      gestureEnabled={true}
      snapPoints={[50, 80]}
      initialSnapIndex={0}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      indicatorStyle={styles.indicator}
      containerStyle={styles.containerStyle}
    >
      <View style={{ flex: 1 }}>
        <View style={{borderBottomColor: COLORS.border, borderBottomWidth: 1, paddingBottom: 8}}>
          <Text style={styles.title}>Bình luận</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ flex: 1 }}>
            <FlashList
              data={comments}
              renderItem={({ item }) => <Comment item={item} />}
              keyExtractor={(item: any) => item._id}
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" /> : null}
            />
          </View>
        )}
        <View style={{ backgroundColor: '#ffffff', borderTopColor: '#bdbdbd', borderTopWidth: 1, paddingHorizontal: 12}}>
          <SizedBox height={12}/>
            <View style = {[commonStyles.flexRow, commonStyles.alignItemsCenter,commonStyles.gap8]}>
              <FastImage source={images.avater_random} style = {{height: 48, width: 48, borderRadius: 9999}}/>
              <View style={{ flex: 1 }}>
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

export default CommentSheet;

const styles = StyleSheet.create({
  containerStyle: {
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#ffffff',
  },
  indicator: {
    width: 44,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 3,
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 6,
    textAlign: 'center'
  }
});
