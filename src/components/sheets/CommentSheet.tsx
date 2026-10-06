import React, { useState, useMemo } from 'react';
import ActionSheet, { SheetProps, SheetManager } from 'react-native-actions-sheet';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SizedBox } from '../separate-components';
import { BaseText, FastImage, BaseTextInput } from '../rn-components';
import { Avatar } from '../avatar';
import { useInfiniteQuery } from '@tanstack/react-query';
import { commentApi } from '~/api/commentApi';
import { mediaApi } from '~/api/mediaApi';
import { FlashList } from '@shopify/flash-list';
import Comment from '../comment/Comment';
import { useCommentMutation, useTheme, Theme, useAuthStore } from '~/hooks';
import { Typography } from '~/constants';
import { CameraLightIcon, CrossIcon } from '~/assets/svgs';
import { SelectedChatMedia } from './MediaSheet';
import { IComment } from '~/interfaces';

const CommentSheet = (props: SheetProps<"CommentSheet">) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const currentUser = useAuthStore(state => state.user);
  const { targetId, targetType } = props.payload || {};
  const [commentText, setCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<SelectedChatMedia | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createComment } = useCommentMutation();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['comments', targetId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!targetId) return { data: [], pagination: { totalPages: 1, page: 1 } };
      const res = await commentApi.getCommentsByTarget(targetId, pageParam, 20);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: { pagination?: { page: number; totalPages: number } }) => {
      if (lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!targetId
  });

  const handleSendComment = async () => {
    if ((!commentText.trim() && !selectedImage) || !targetId || !targetType || isUploading) return;

    try {
      let uploadedMedia: { url: string; type: string } | undefined = undefined;

      if (selectedImage) {
        setIsUploading(true);
        const uploadRes = await mediaApi.uploadImage(selectedImage.uri, undefined, undefined, false);
        const uploadedUrl = uploadRes?.url || selectedImage.uri;
        uploadedMedia = {
          url: uploadedUrl,
          type: 'image',
        };
      }

      await createComment.mutateAsync({
        targetId,
        targetType,
        content: commentText.trim(),
        media: uploadedMedia,
      });

      setCommentText('');
      setSelectedImage(null);
    } catch (error: any) {
      console.log('Error creating comment:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Không thể tạo bình luận');
    } finally {
      setIsUploading(false);
    }
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
              keyExtractor={(item: IComment) => item.id || ''}
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
          <SizedBox height={8}/>
          {selectedImage ? (
            <View style={styles.mediaPreviewContainer}>
              <View style={styles.mediaPreviewWrapper}>
                <FastImage
                  source={{ uri: selectedImage.uri }}
                  style={styles.mediaPreviewThumb}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => setSelectedImage(null)}
                  disabled={isUploading}
                >
                  <CrossIcon width={12} height={12} color="#FFFFFF" />
                </TouchableOpacity>
                {isUploading ? (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
          <View style={styles.inputRow}>
            <Avatar 
              url={currentUser?.avatarUrl || currentUser?.imageUrl} 
              size={40} 
              disabled 
            />
            <View style={styles.commentInputContainer}>
              <TouchableOpacity 
                style={styles.cameraIcon}
                onPress={() => {
                  SheetManager.show('MediaSheet', {
                    payload: {
                      mediaType: 'image',
                      onSelectMedia: (media: SelectedChatMedia) => setSelectedImage(media),
                    },
                  });
                }}
                disabled={isUploading}
              >
                <CameraLightIcon height={24} width={24} color={theme.text} />
              </TouchableOpacity>
              <View style={styles.textInputWrapper}>
                <BaseTextInput 
                  placeholder='Tham gia cuộc trò chuyện...'
                  placeholderTextColor={theme.placeholder ?? '#9e9e9e'}
                  value={commentText}
                  onChangeText={setCommentText}
                  onSubmitEditing={handleSendComment}
                  returnKeyType="send"
                  style={styles.input}
                  editable={!isUploading}
                />
              </View>
              {(commentText.trim().length > 0 || selectedImage) ? (
                <TouchableOpacity 
                  onPress={handleSendComment} 
                  disabled={isUploading || createComment.isPending}
                  style={styles.sendButton}
                >
                  {isUploading || createComment.isPending ? (
                    <ActivityIndicator size="small" color="#3797EF" />
                  ) : (
                    <BaseText typography={Typography.bodyBold.medium} color="#3797EF">
                      Gửi
                    </BaseText>
                  )}
                </TouchableOpacity>
              ) : null}
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
  commentInputContainer: {
    flex: 1,
    borderRadius: 9999,
    minHeight: 40,
    backgroundColor: theme.input,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 8,
  },
  cameraIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputWrapper: {
    flex: 1,
  },
  input: {
    paddingVertical: 8,
    color: theme.text,
  },
  sendButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreviewContainer: {
    paddingBottom: 8,
    flexDirection: 'row',
  },
  mediaPreviewWrapper: {
    width: 64,
    height: 64,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.divider,
  },
  mediaPreviewThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentSheet;
