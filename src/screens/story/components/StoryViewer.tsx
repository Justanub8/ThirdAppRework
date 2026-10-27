import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { VideoRef } from 'react-native-video';
import { Avatar } from '~/components/avatar';
import { BaseText, BaseTextInput, FastImage } from '~/components/rn-components';
import {
  CrossIcon,
  HeartIcon,
  MessageLightIcon,
  NotificationIcon,
  PersonWithShadowIcon,
  MenuIcon,
} from '~/assets/svgs';
import { Typography } from '~/constants';
import { useTheme, Theme } from '~/hooks';
import { timeAgo, isVideoMedia } from '~/utils';
import { IStory } from '~/interfaces';
import { MultiProgressBar } from './MultipleProgressBar';
import StoryVideoItem from './StoryVideoItem';

const IMAGE_STORY_DURATION_MS = 5000;

export interface StoryViewerProps {
  stories: IStory[];
  isLoading?: boolean;
  isOwnStory?: boolean;
  activeIndex: number;
  setActiveIndex: (val: number | ((prev: number) => number)) => void;
  onClose: () => void;
  onNextUser?: () => void;
  onPrevUser?: () => void;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onStoryViewed?: (story: IStory) => void;
  onSendReply?: (content: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  isLoading = false,
  isOwnStory = false,
  activeIndex,
  setActiveIndex,
  onClose,
  onNextUser,
  onPrevUser,
  isLiked = false,
  onToggleLike,
  onStoryViewed,
  onSendReply,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { bottom } = useSafeAreaInsets();
  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };

  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(IMAGE_STORY_DURATION_MS);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  const progress = useSharedValue(0);
  const videoRef = useRef<VideoRef>(null);

  const totalStories = stories.length;
  const currentStory = stories[activeIndex];
  const isVideo = isVideoMedia(currentStory?.media);
  const mediaUrl = currentStory?.media?.url;
  const author = currentStory?.user;
  const createdAt = currentStory?.createdAt;

  useEffect(() => {
    setHasVideoError(false);
    if (currentStory && onStoryViewed) {
      onStoryViewed(currentStory);
    }
  }, [activeIndex, currentStory, onStoryViewed]);

  const handleNext = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (activeIndex < totalStories - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (onNextUser) {
      onNextUser();
    } else {
      onClose();
    }
  }, [
    activeIndex,
    totalStories,
    onNextUser,
    onClose,
    progress,
    setActiveIndex,
  ]);

  const handlePrevious = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    } else if (onPrevUser) {
      onPrevUser();
    } else {
      onClose();
    }
  }, [activeIndex, onPrevUser, onClose, progress, setActiveIndex]);

  const startAnimation = useCallback(
    (targetDurationMs: number, fromProgress: number = 0) => {
      cancelAnimation(progress);
      progress.value = fromProgress;
      const remainingTime = Math.max(0, (1 - fromProgress) * targetDurationMs);
      progress.value = withTiming(
        1,
        {
          duration: remainingTime,
          easing: Easing.linear,
        },
        finished => {
          if (finished) {
            runOnJS(handleNext)();
          }
        },
      );
    },
    [progress, handleNext],
  );

  useEffect(() => {
    if (!currentStory) return;

    if (isVideo) {
      cancelAnimation(progress);
      progress.value = 0;
    } else {
      setDuration(IMAGE_STORY_DURATION_MS);
      if (!isPaused) {
        startAnimation(IMAGE_STORY_DURATION_MS, 0);
      }
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [currentStory, isVideo, isPaused, startAnimation, progress]);

  const handlePressIn = () => {
    setIsPaused(true);
    cancelAnimation(progress);
  };

  const handlePressOut = () => {
    setIsPaused(false);
    if (!isVideo) {
      startAnimation(duration, progress.value);
    }
  };

  const handleSend = () => {
    if (!messageContent.trim()) return;
    if (onSendReply) {
      onSendReply(messageContent.trim());
    }
    setMessageContent('');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (totalStories === 0) {
    return (
      <View style={styles.centerContainer}>
        <BaseText typography={Typography.bodyMedium.large}>
          Không có tin nào
        </BaseText>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <BaseText color={theme.blue}>Quay lại</BaseText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mediaWrapper}>
        {isVideo && mediaUrl ? (
          hasVideoError ? (
            <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
              <BaseText
                color={theme.white}
                typography={Typography.bodyMedium.medium}
              >
                Không thể phát nội dung
              </BaseText>
            </View>
          ) : (
            <StoryVideoItem
              ref={videoRef}
              url={mediaUrl}
              style={styles.media}
              isPaused={isPaused}
              onLoad={data => {
                const videoDuration = (data.duration || 5) * 1000;
                setDuration(videoDuration);
                startAnimation(videoDuration, 0);
              }}
              onEnd={handleNext}
              onError={() => {
                setHasVideoError(true);
              }}
            />
          )
        ) : mediaUrl ? (
          <FastImage
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.emptyMediaContainer]}>
            <BaseText
              color={theme.lightGrey}
              typography={Typography.bodyMedium.medium}
              style={styles.emptyMediaText}
            >
              Không có nội dung hiển thị
            </BaseText>
          </View>
        )}
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.touchRow}>
          <TouchableOpacity
            style={styles.touchArea}
            activeOpacity={1}
            onPress={handlePrevious}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
          <TouchableOpacity
            style={styles.touchArea}
            activeOpacity={1}
            onPress={handleNext}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </View>
      </View>

      <SafeAreaView style={styles.safeAreaContainer} pointerEvents="box-none">
        <View style={styles.progressWrapper}>
          <MultiProgressBar
            total={totalStories}
            activeIndex={activeIndex}
            progress={progress}
          />
        </View>
        <View style={styles.headerBar}>
          <View style={styles.authorInfo}>
            <Avatar
              url={author?.avatarUrl || author?.imageUrl}
              size={36}
              id={author?.id}
              disabled
            />
            <BaseText
              color={theme.white}
              typography={Typography.bodyBold.medium}
            >
              {isOwnStory ? 'Tin của bạn' : author?.username || 'user'}
            </BaseText>
            <BaseText
              color={theme.white}
              typography={Typography.bodyRegular.small}
            >
              {timeAgo(createdAt)}
            </BaseText>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={hitSlop8}>
            <CrossIcon width={28} height={28} color={theme.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isOwnStory ? (
        <View style={[styles.footerBar, { bottom: bottom + 8 }]}>
          <View style={styles.footerContent}>
            <TouchableOpacity style={styles.icon}>
              <PersonWithShadowIcon width={32} height={32} />
              <BaseText typography={Typography.bodyMedium.small}>
                Lượt xem ({currentStory?.viewCount || 0})
              </BaseText>
            </TouchableOpacity>
            <View style={styles.footerRightActions}>
              <TouchableOpacity style={styles.icon}>
                <MessageLightIcon width={32} height={32} />
                <BaseText typography={Typography.bodyMedium.small}>
                  Gửi
                </BaseText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.icon}>
                <MenuIcon width={32} height={32} />
                <BaseText typography={Typography.bodyMedium.small}>
                  Khác
                </BaseText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.footerBar, { bottom: bottom + 8 }]}>
          <View style={styles.messageInput}>
            <BaseTextInput
              placeholder="Gửi tin nhắn..."
              placeholderTextColor={theme.overlayWhite70}
              value={messageContent}
              onChangeText={setMessageContent}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              color={theme.white}
            />
          </View>
          <TouchableOpacity onPress={handleSend}>
            <MessageLightIcon width={26} height={26} color={theme.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggleLike}
            activeOpacity={0.7}
            hitSlop={hitSlop8}
          >
            {isLiked ? (
              <HeartIcon width={28} height={28} color={theme.heartRed} />
            ) : (
              <NotificationIcon width={28} height={28} color={theme.white} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.black,
    },
    mediaWrapper: {
      zIndex: 0,
      ...StyleSheet.absoluteFill,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.black,
    },
    media: {
      width: '100%',
      height: '100%',
      zIndex: -1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      gap: 16,
    },
    errorContainer: {
      backgroundColor: theme.black,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    emptyMediaContainer: {
      backgroundColor: theme.darkPlaceholder,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    emptyMediaText: {
      textAlign: 'center',
    },
    safeAreaContainer: {
      flex: 1,
    },
    progressWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    backButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    headerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 16,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    touchRow: {
      flex: 1,
      flexDirection: 'row',
    },
    touchArea: {
      flex: 1,
      height: '100%',
    },
    footerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 20,
      gap: 12,
    },
    footerContent: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    footerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    icon: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.overlayWhite40,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
  });

export default React.memo(StoryViewer);
