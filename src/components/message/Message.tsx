import { TouchableOpacity, View, StyleSheet } from 'react-native';
import * as React from 'react';
import { IMessage } from '~/interfaces';
import { BaseText } from '~/components/rn-components';
import { useAuthStore } from '~/hooks';
import dayjs from 'dayjs';
import { Typography } from '~/constants';
import {
  MessageVideoItem,
  MessageImageItem,
  ReactBadge,
} from '~/components/message/components';
import { isVideoMedia, Navigation, isEmojiOnlyText } from '~/utils';
import { MessagePopUp } from '~/components/pop-up';

const TIME_THRESHOLD_MINUTES = 15;

interface MessageProps {
  item: IMessage;
  previous?: IMessage;
  senderNickname?: string;
  isRefreshing?: boolean;
  currentUserId?: string;
  activePlayingVideoId?: string | null;
  onTogglePlayVideo?: (videoId: string) => void;
  onReply?: (message: IMessage) => void;
  onCopy?: (message: IMessage) => void;
  onPin?: (message: IMessage) => void;
  onDelete?: (message: IMessage) => void;
  onForward?: (message: IMessage) => void;
  onEdit?: (message: IMessage) => void;
  onSelectEmoji?: (message: IMessage, emoji: string) => void;
  onRetry?: (message: IMessage) => void;
}

const Message = ({
  item,
  previous,
  senderNickname,
  isRefreshing,
  currentUserId,
  activePlayingVideoId,
  onTogglePlayVideo,
  onReply,
  onCopy,
  onPin,
  onDelete,
  onForward,
  onEdit,
  onSelectEmoji,
  onRetry,
}: MessageProps) => {
  const storeUserId = useAuthStore(state => state.user?.id);
  const userId = currentUserId || storeUserId;
  const senderObj =
    item.sender || (typeof item.senderId === 'object' ? item.senderId : null);
  const messageSenderId =
    senderObj?.id ||
    (typeof item.senderId === 'string' ? item.senderId : undefined);
  const isMyMessage = !!userId && messageSenderId === userId;
  const senderDisplayName =
    senderNickname || senderObj?.name || senderObj?.username || 'Unknown';
  const [showTime, setShowTime] = React.useState(false);
  const [showName, setShowName] = React.useState(false);
  const bubbleRef = React.useRef<View>(null);
  const [showPopup, setShowPopup] = React.useState(false);
  const hasLargeTimeDiff = React.useMemo(() => {
    if (!previous) return true;
    const currentMessageTime = dayjs(item.createdAt);
    const previousMessageTime = dayjs(previous.createdAt);
    return (
      Math.abs(currentMessageTime.diff(previousMessageTime, 'minute')) >
      TIME_THRESHOLD_MINUTES
    );
  }, [item.createdAt, previous]);

  React.useEffect(() => {
    if (isRefreshing) {
      setShowTime(false);
      setShowName(false);
      setShowPopup(false);
    }
  }, [isRefreshing]);

  const hasReactions = Boolean(item.emojis && item.emojis.length > 0);
  const hasMedia = Boolean(item.media && item.media.length > 0);
  const hasContent = Boolean(item.content && item.content.trim().length > 0);
  const isOnlyEmoji = React.useMemo(() => {
    if (hasMedia || !hasContent) return false;
    return isEmojiOnlyText(item.content!);
  }, [hasMedia, hasContent, item.content]);

  const isDeleted =
    item.status === 'Deleted' || (item.status as string) === 'DELETED';

  const handleLongPress = React.useCallback(() => {
    if (isDeleted) return;
    setShowPopup(true);
  }, [isDeleted]);

  const renderBubbleContent = () => {
    if (isDeleted) {
      return (
        <BaseText typography={Typography.bodySemiBold.large} color={'#cdcaca'}>
          Tin nhắn đã bị xoá
        </BaseText>
      );
    }
    return (
      <>
        {hasMedia ? (
          <View style={styles.mediaContainer}>
            {item.media!.map((m, idx) => {
              const isVideo = isVideoMedia(m);
              const videoId = m.id || `${item.id || 'msg'}_${m.url || idx}`;
              const isPlaying = activePlayingVideoId === videoId;
              return (
                <View key={m.id || idx} style={styles.mediaItemWrapper}>
                  {isVideo ? (
                    <MessageVideoItem
                      url={m.url}
                      videoId={videoId}
                      isPaused={!isPlaying}
                      onTogglePlay={onTogglePlayVideo}
                      onPress={(thumb?: string) =>
                        Navigation.goToDetailMedia(m.url, 'video', thumb)
                      }
                      onLongPress={handleLongPress}
                    />
                  ) : (
                    <MessageImageItem
                      url={m.url}
                      onPress={() => Navigation.goToDetailMedia(m.url, 'image')}
                      onLongPress={handleLongPress}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        {hasContent ? (
          <View>
            <BaseText
              color={
                isOnlyEmoji ? undefined : isMyMessage ? '#FFFFFF' : '#000000'
              }
              typography={
                isOnlyEmoji ? undefined : Typography.bodyRegular.medium
              }
              style={[
                hasMedia ? styles.textContentInMedia : undefined,
                isOnlyEmoji ? styles.emojiText : undefined,
              ]}
            >
              {item.content}
            </BaseText>
          </View>
        ) : null}
      </>
    );
  };

  return (
    <View style={styles.messageWrapper}>
      {showTime || hasLargeTimeDiff ? (
        <View style={styles.timeContainer}>
          <BaseText typography={Typography.bodyMedium.small} color="#8E8E8E">
            {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
          </BaseText>
        </View>
      ) : null}
      {showName || hasLargeTimeDiff ? (
        <BaseText
          typography={Typography.bodyMedium.small}
          color="#8E8E8E"
          style={[
            styles.senderName,
            isMyMessage ? styles.selfAlignEnd : styles.selfAlignStart,
          ]}
        >
          {senderDisplayName}
        </BaseText>
      ) : null}

      {item.status === 'Edited' && !isOnlyEmoji ? (
        <BaseText
          color={isMyMessage ? 'rgba(255, 255, 255, 0.7)' : '#8E8E8E'}
          typography={Typography.bodyRegular.xSmall}
          style={styles.editedText}
        >
          Đã chỉnh sửa
        </BaseText>
      ) : null}

      {item.status === 'Pinned' && !isOnlyEmoji ? (
        <BaseText
          color={isMyMessage ? 'rgba(255, 255, 255, 0.7)' : '#8E8E8E'}
          typography={Typography.bodyRegular.xSmall}
          style={styles.editedText}
        >
          Đã ghim
        </BaseText>
      ) : null}

      {item.status === 'Sending' ? (
        <BaseText
          color={isMyMessage ? 'rgba(255, 255, 255, 0.7)' : '#8E8E8E'}
          typography={Typography.bodyRegular.xSmall}
          style={styles.editedText}
        >
          Đang gửi...
        </BaseText>
      ) : null}

      {item.status === 'Failed' ? (
        <TouchableOpacity
          onPress={() => onRetry?.(item)}
          style={[
            styles.failedContainer,
            isMyMessage ? styles.selfAlignEnd : styles.selfAlignStart,
          ]}
          activeOpacity={0.7}
        >
          <BaseText
            color="#FF3B30"
            typography={Typography.bodyRegular.xSmall}
          >
            Gửi thất bại • Chạm để thử lại
          </BaseText>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        ref={bubbleRef}
        style={[
          styles.bubble,
          (hasMedia && !hasContent) || isOnlyEmoji
            ? styles.bubbleWithOnlyMedia
            : isMyMessage
            ? styles.myBubble
            : styles.otherBubble,
          isMyMessage ? styles.selfAlignEnd : styles.selfAlignStart,
          hasReactions ? styles.bubbleWithReactions : undefined,
          item.status === 'Sending' ? styles.sendingBubble : undefined,
          item.status === 'Failed' ? styles.failedBubble : undefined,
        ]}
        onPress={() => {
          setShowTime(!showTime);
          setShowName(!showName);
        }}
        onLongPress={handleLongPress}
        delayLongPress={250}
        activeOpacity={0.85}
      >
        {renderBubbleContent()}
        {hasReactions ? (
          <ReactBadge
            emojis={item.emojis!}
            onRemoveEmoji={emoji => onSelectEmoji?.(item, emoji.content)}
          />
        ) : null}
      </TouchableOpacity>

      <MessagePopUp
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        anchorRef={bubbleRef}
        transformOrigin={isMyMessage ? 'right' : 'left'}
        onSelectEmoji={emoji => {
          onSelectEmoji?.(item, emoji);
        }}
        onReply={() => onReply?.(item)}
        onCopy={() => onCopy?.(item)}
        onPin={() => onPin?.(item)}
        isPinned={item.status === 'Pinned'}
        onForward={() => onForward?.(item)}
        onEdit={() => onEdit?.(item)}
        onDelete={() => onDelete?.(item)}
        showCopy={hasContent && !isDeleted}
        showEdit={isMyMessage && hasContent && !isDeleted}
        showDelete={isMyMessage && !isDeleted}
        showPin={hasContent && !hasMedia && !isDeleted}
      >
        <View
          style={[
            styles.bubble,
            (hasMedia && !hasContent) || isOnlyEmoji
              ? styles.bubbleWithOnlyMedia
              : isMyMessage
              ? styles.myBubble
              : styles.otherBubble,
            styles.floatingBubble,
          ]}
          pointerEvents="none"
        >
          {renderBubbleContent()}
        </View>
      </MessagePopUp>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    width: '100%',
    marginVertical: 2,
  },
  timeContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 6,
  },
  senderName: {
    marginHorizontal: 8,
    marginBottom: 2,
  },
  selfAlignEnd: {
    alignSelf: 'flex-end',
  },
  selfAlignStart: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '75%',
  },
  bubbleWithReactions: {
    marginBottom: 8,
  },
  bubbleWithOnlyMedia: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  floatingBubble: {
    width: '100%',
    height: '100%',
    maxWidth: undefined,
  },
  myBubble: {
    backgroundColor: '#3797EF',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
  },
  otherBubble: {
    backgroundColor: '#9a8e8e',
    borderRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
  mediaContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    gap: 4,
  },
  mediaItemWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  textContentInMedia: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  emojiText: {
    fontSize: 48,
    lineHeight: 56,
  },
  editedText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  sendingBubble: {
    opacity: 0.65,
  },
  failedBubble: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  failedContainer: {
    marginHorizontal: 8,
    marginTop: 2,
    marginBottom: 2,
  },
});

export default React.memo(Message, (prevProps, nextProps) => {
  if (prevProps.item !== nextProps.item) return false;
  if (prevProps.previous !== nextProps.previous) return false;
  if (prevProps.isRefreshing !== nextProps.isRefreshing) return false;
  if (prevProps.currentUserId !== nextProps.currentUserId) return false;
  if (prevProps.onTogglePlayVideo !== nextProps.onTogglePlayVideo) return false;
  if (prevProps.onReply !== nextProps.onReply) return false;
  if (prevProps.onCopy !== nextProps.onCopy) return false;
  if (prevProps.onPin !== nextProps.onPin) return false;
  if (prevProps.onDelete !== nextProps.onDelete) return false;
  if (prevProps.onEdit !== nextProps.onEdit) return false;
  if (prevProps.onForward !== nextProps.onForward) return false;
  if (prevProps.onSelectEmoji !== nextProps.onSelectEmoji) return false;
  if (prevProps.onRetry !== nextProps.onRetry) return false;

  if (prevProps.activePlayingVideoId !== nextProps.activePlayingVideoId) {
    const checkHasVideo = (msg: IMessage, targetId?: string | null) => {
      if (!targetId || !msg.media || msg.media.length === 0) return false;
      return msg.media.some((m, idx) => {
        const vid = m.id || `${msg.id || 'msg'}_${m.url || idx}`;
        return vid === targetId;
      });
    };

    const wasPlayingInThisMsg = checkHasVideo(
      prevProps.item,
      prevProps.activePlayingVideoId,
    );
    const isNowPlayingInThisMsg = checkHasVideo(
      nextProps.item,
      nextProps.activePlayingVideoId,
    );

    if (wasPlayingInThisMsg || isNowPlayingInThisMsg) {
      return false;
    }
    return true;
  }

  return true;
});
