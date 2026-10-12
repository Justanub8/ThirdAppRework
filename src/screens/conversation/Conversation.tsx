import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { memo, useCallback, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { conversationApi } from '~/api';
import {
  ArrowToLeft,
  CallIcon,
  VideoCallIcon,
  CameraLightIcon,
  CrossIcon,
  PlayIcon,
} from '~/assets/svgs';
import { BaseText, BaseTextInput, FastImage } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { Navigation, timeAgo } from '~/utils';
import { RouteProp, useRoute } from '@react-navigation/native';
import { IMessage } from '~/interfaces';
import Message from '~/components/message/Message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '~/constants';
import { useTheme, Theme } from '~/hooks';
import { useOnlineStatus, useCall } from '~/context';
import { useQuery } from '@tanstack/react-query';
import { SheetManager } from 'react-native-actions-sheet';
import { SelectedChatMedia } from '~/components/sheets/MediaSheet';
import { useConversationLogic } from '~/screens/conversation/components';
import ClipBoard from '@react-native-clipboard/clipboard';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'Conversation'>;

const MIN_INPUT_HEIGHT = 32;
const MAX_INPUT_HEIGHT = 100;

const Conversation = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const route = useRoute<RouteProps>();
  const { startCall } = useCall();
  const {
    id = '',
    name: initialName,
    imageUrl: initialImageUrl,
  } = route.params || {};

  const {
    messages,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
    isTexting,
    setIsTexting,
    messageContent,
    setMessageContent,
    inputHeight,
    setInputHeight,
    selectedMedia,
    setSelectedMedia,
    isUploading,
    showScrollButton,
    fadeAnim,
    activePlayingVideoId,
    listRef,
    inputRef,
    user,
    editingMessage,
    handleStartEdit,
    handleCancelEdit,
    handleDeleteMessage,
    handlePinMessage,
    handleReact,
    handleRefresh,
    handleLoadMore,
    handleScroll,
    handleTogglePlayVideo,
    handleSend,
    scrollToBottom,
    keyExtractor,
  } = useConversationLogic({ id });

  const computedInputHeight =
    messageContent.length > 0
      ? Math.min(MAX_INPUT_HEIGHT, Math.max(MIN_INPUT_HEIGHT, inputHeight))
      : MIN_INPUT_HEIGHT;

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.subtext} />
      </View>
    );
  }, [isFetchingNextPage, styles.footerLoading, theme.subtext]);

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const res = await conversationApi.getConversationById(id);
      return res.data?.data || (res.data as any);
    },
    enabled: !!id,
  });

  const currentUserId = user?.id;
  const otherMember =
    conversationData?.members?.find(m => m.userId !== currentUserId) ||
    conversationData?.members?.[0];
  const otherUser = otherMember?.user;

  const { isOnline: isSocketOnline } = useOnlineStatus(otherUser?.id);
  const isOtherUserOnline = isSocketOnline || !!otherUser?.isOnline;

  const groupMembers =
    conversationData?.members?.filter(m => m.userId !== currentUserId) || [];
  const fallbackGroupName = groupMembers
    .map(m => m.nickname || m.user?.name || m.user?.username)
    .filter(Boolean)
    .join(', ');

  const displayName =
    conversationData?.name ||
    initialName ||
    (conversationData?.isGroup
      ? fallbackGroupName
      : otherMember?.nickname || otherUser?.name || otherUser?.username) ||
    'Unknown';
  const displayAvatar =
    conversationData?.avatarUrl ||
    initialImageUrl ||
    otherUser?.avatarUrl ||
    otherUser?.imageUrl;

  const renderItem = useCallback(
    ({ item, index }: { item: IMessage; index: number }) => {
      const previous =
        index < messages.length - 1 ? messages[index + 1] : undefined;
      return (
        <Message
          item={item}
          previous={previous}
          isRefreshing={isRefreshing}
          currentUserId={user?.id}
          activePlayingVideoId={activePlayingVideoId}
          onTogglePlayVideo={handleTogglePlayVideo}
          onCopy={() => {
            if (item.content) {
              ClipBoard.setString(item.content);
            }
          }}
          onDelete={handleDeleteMessage}
          onForward={() => {}}
          onPin={handlePinMessage}
          onReply={() => {}}
          onSelectEmoji={handleReact}
          onEdit={handleStartEdit}
        />
      );
    },
    [
      messages,
      isRefreshing,
      user?.id,
      activePlayingVideoId,
      handleTogglePlayVideo,
      handleStartEdit,
      handleDeleteMessage,
      handlePinMessage,
      handleReact,
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => Navigation.pop()}
          style={styles.zIndex1}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowToLeft height={24} width={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerUser}
          onPress={() => {
            Navigation.goToConversationDetail(id);
          }}
          disabled={!otherUser?.id}
          activeOpacity={0.8}
        >
          <Avatar
            url={displayAvatar}
            size={36}
            disabled
            isOnline={isOtherUserOnline}
          />
          <View>
            <BaseText typography={Typography.bodyBold.medium} numberOfLines={1}>
              {displayName}
            </BaseText>
            {otherUser?.showActiveStatus && user?.showActiveStatus ? (
              <BaseText
                typography={Typography.bodyRegular.xSmall}
                color={theme.activeGreen}
              >
                {timeAgo(otherUser?.lastActive, 'Đang hoạt động')}
              </BaseText>
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              if (otherUser?.id) {
                startCall(otherUser.id, 'audio', {
                  name: displayName,
                  avatarUrl: displayAvatar,
                });
              }
            }}
            disabled={!otherUser?.id}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <CallIcon height={22} width={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              if (otherUser?.id) {
                startCall(otherUser.id, 'video', {
                  name: displayName,
                  avatarUrl: displayAvatar,
                });
              }
            }}
            disabled={!otherUser?.id}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <VideoCallIcon height={22} width={22} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.flex1}>
          <FlashList
            ref={listRef}
            inverted={true}
            data={messages}
            extraData={activePlayingVideoId}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
          <View style={styles.inputContainer}>
            <View style={styles.unifiedInputWrapper}>
              {editingMessage ? (
                <View style={styles.editBarContainer}>
                  <View style={styles.editBarAccentLine} />
                  <View style={styles.editBarContent}>
                    <BaseText
                      typography={Typography.bodyBold.small}
                      color={theme.primaryBlue}
                    >
                      Chỉnh sửa tin nhắn
                    </BaseText>
                    <BaseText
                      typography={Typography.bodyRegular.small}
                      color={theme.subtext}
                      numberOfLines={1}
                    >
                      {editingMessage.content}
                    </BaseText>
                  </View>
                  <TouchableOpacity
                    style={styles.cancelEditButton}
                    onPress={handleCancelEdit}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CrossIcon width={10} height={10} color={theme.subtext} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {selectedMedia ? (
                <View style={styles.mediaPreviewContainer}>
                  <View style={styles.mediaPreviewWrapper}>
                    <FastImage
                      source={{ uri: selectedMedia.uri }}
                      style={styles.mediaPreviewThumb}
                      resizeMode="cover"
                    />
                    {selectedMedia.type === 'video' ? (
                      <View style={styles.videoBadgeSmall}>
                        <PlayIcon width={10} height={10} color={theme.white} />
                      </View>
                    ) : null}
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => setSelectedMedia(null)}
                      disabled={isUploading}
                    >
                      <CrossIcon width={12} height={12} color={theme.white} />
                    </TouchableOpacity>
                    {isUploading ? (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color={theme.white} />
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
              <View style={styles.messageInputRow}>
                {(!isTexting || messageContent.trim().length === 0) &&
                !editingMessage ? (
                  <TouchableOpacity
                    style={styles.cameraIcon}
                    onPress={() => {
                      SheetManager.show('MediaSheet', {
                        payload: {
                          onSelectMedia: (media: SelectedChatMedia) =>
                            setSelectedMedia(media),
                        },
                      });
                    }}
                    disabled={isUploading}
                  >
                    <CameraLightIcon height={20} width={20} />
                  </TouchableOpacity>
                ) : null}
                <View style={styles.textInputWrapper}>
                  <BaseTextInput
                    style={[styles.textInput, { height: computedInputHeight }]}
                    ref={inputRef}
                    placeholder={
                      editingMessage
                        ? 'Chỉnh sửa tin nhắn...'
                        : 'Nhập tin nhắn...'
                    }
                    value={messageContent}
                    onChangeText={text => {
                      setMessageContent(text);
                      if (!text) {
                        setInputHeight(MIN_INPUT_HEIGHT);
                      }
                    }}
                    onFocus={() => setIsTexting(true)}
                    onBlur={() => setIsTexting(false)}
                    onContentSizeChange={e => {
                      const nextHeight = e.nativeEvent.contentSize.height;
                      if (nextHeight > 0) {
                        setInputHeight(nextHeight);
                      }
                    }}
                    onSubmitEditing={handleSend}
                    multiline={true}
                  />
                </View>
                {messageContent.trim().length > 0 ||
                selectedMedia ||
                editingMessage ? (
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={isUploading}
                    style={styles.sendButton}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color={theme.primaryBlue} />
                    ) : (
                      <BaseText
                        typography={Typography.bodyBold.medium}
                        color={theme.primaryBlue}
                      >
                        Gửi
                      </BaseText>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
          <Animated.View
            style={[styles.fabContainer, { opacity: fadeAnim }]}
            pointerEvents={showScrollButton ? 'auto' : 'none'}
          >
            <TouchableOpacity style={styles.fabButton} onPress={scrollToBottom}>
              <ArrowToLeft
                height={24}
                width={24}
                style={styles.fabArrowRotated}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      {isLoading && !isRefreshing && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="large" color={theme.black} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default memo(Conversation);

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    flex1: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.border,
      height: 60,
    },
    headerUser: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      zIndex: 1,
    },
    headerBtn: {
      padding: 4,
    },
    zIndex1: {
      zIndex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    fabContainer: {
      position: 'absolute',
      bottom: 60,
      right: 16,
      zIndex: 10,
    },
    fabButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.darkGrey,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    unifiedInputWrapper: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      backgroundColor: theme.input,
      overflow: 'hidden',
    },
    messageInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: 44,
      gap: 8,
    },
    cameraIcon: {
      backgroundColor: theme.bubbleLavender,
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginBottom: 0,
    },
    textInputWrapper: {
      flex: 1,
      justifyContent: 'center',
      minHeight: 32,
    },
    textInput: {
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    sendButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    mediaPreviewContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.input,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
      flexDirection: 'row',
    },
    mediaPreviewWrapper: {
      width: 56,
      height: 56,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    mediaPreviewThumb: {
      width: '100%',
      height: '100%',
    },
    videoBadgeSmall: {
      position: 'absolute',
      bottom: 4,
      left: 4,
      backgroundColor: theme.overlaySubtle,
      borderRadius: 4,
      padding: 4,
    },
    removeMediaButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.overlayDark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlayMedium,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingOverlay: {
      justifyContent: 'center',
      alignItems: 'center',
      top: 48,
    },
    editBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.input,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
      gap: 8,
    },
    editBarAccentLine: {
      width: 4,
      height: 28,
      borderRadius: 4,
      backgroundColor: theme.primaryBlue,
    },
    editBarContent: {
      flex: 1,
    },
    cancelEditButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.darkGrey,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerLoading: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    fabArrowRotated: {
      transform: [{ rotate: '-90deg' }],
    },
  });
