import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Theme, useAuthStore, useTheme } from '~/hooks';
import { useQuery } from '@tanstack/react-query';
import { storyApi } from '~/api';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BaseText, FastImage } from '~/components/rn-components';
import { Typography } from '~/constants';
import {
  CrossIcon,
  MenuIcon,
  MessageLightIcon,
  PersonWithShadowIcon,
} from '~/assets/svgs';
import { Navigation } from '~/utils';
import { VideoRef } from 'react-native-video';
import { MultiProgressBar } from '~/screens/story/components/MultipleProgressBar';
import StoryVideoItem from '~/screens/story/components/StoryVideoItem';
import { Avatar } from '~/components/avatar';
import { timeAgo, isVideoMedia } from '~/utils';

const IMAGE_STORY_DURATION_MS = 5 * 1000;

const MyActiveStory = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const hitSlop8 = { top: 8, bottom: 8, left: 8, right: 8 };
  const { user } = useAuthStore();
  const { bottom } = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const videoRef = useRef<VideoRef>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasVideoError(false);
  }, [activeIndex]);

  const { data: stories = [], refetch } = useQuery({
    queryKey: ['my-story'],
    queryFn: async () => {
      const res = await storyApi.getAllStories(1, 20, user?.id);
      return res.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const totalStories = stories.length;
  const currentStory = stories[activeIndex];
  const isVideo = isVideoMedia(currentStory?.media);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleNext = useCallback(() => {
    if (activeIndex < totalStories - 1) {
      setActiveIndex(prev => prev + 1);
      setProgress(0);
      setDuration(1);
    } else {
      Navigation.goBack();
    }
  }, [activeIndex, totalStories]);

  const handlePrevious = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setProgress(0);
      setDuration(1);
    } else {
      Navigation.goBack();
    }
  }, [activeIndex]);

  useEffect(() => {
    if (!currentStory || isVideo || isPaused) {
      if (imageTimerRef.current) clearInterval(imageTimerRef.current);
      return;
    }

    const intervalTime = 50;
    const step = intervalTime / IMAGE_STORY_DURATION_MS;

    imageTimerRef.current = setInterval(() => {
      setProgress(prev => {
        const nextProgress = prev + step;
        if (nextProgress >= 1) {
          if (imageTimerRef.current) clearInterval(imageTimerRef.current);
          handleNext();
          return 0;
        }
        return nextProgress;
      });
    }, intervalTime);

    return () => {
      if (imageTimerRef.current) clearInterval(imageTimerRef.current);
    };
  }, [currentStory, isVideo, isPaused, handleNext]);

  const mediaUrl = currentStory?.media?.url;
  const author = currentStory?.user;
  const createdAt = currentStory?.createdAt;

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
              onLoad={data => setDuration(data.duration || 1)}
              onProgress={data => {
                if (duration > 0) {
                  setProgress(data.currentTime / duration);
                }
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
            onPressIn={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
          />
          <TouchableOpacity
            style={styles.touchArea}
            activeOpacity={1}
            onPress={handleNext}
            onPressIn={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
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
            <BaseText color={theme.white} typography={Typography.bodyBold.medium}>
              Tin của bạn
            </BaseText>
            <BaseText color={theme.white} typography={Typography.bodyRegular.small}>
              {timeAgo(createdAt)}
            </BaseText>
          </View>
          <TouchableOpacity
            onPress={() => Navigation.goBack()}
            hitSlop={hitSlop8}
          >
            <CrossIcon width={28} height={28} color={theme.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.footerBar, { bottom: bottom + 8 }]}>
        <View style={styles.footerContent}>
          <TouchableOpacity style={styles.icon}>
            <PersonWithShadowIcon width={32} height={32} />
            <BaseText typography={Typography.bodyMedium.small}>
              Hoạt động
            </BaseText>
          </TouchableOpacity>
          <View style={styles.footerRightActions}>
            <TouchableOpacity style={styles.icon}>
              <MessageLightIcon width={32} height={32} />
              <BaseText typography={Typography.bodyMedium.small}>
                Tin nổi bật
              </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon}>
              <MessageLightIcon width={32} height={32} />
              <BaseText typography={Typography.bodyMedium.small}>
                Nhắc đến
              </BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon}>
              <MessageLightIcon width={32} height={32} />
              <BaseText typography={Typography.bodyMedium.small}>Gửi</BaseText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon}>
              <MenuIcon width={32} height={32} />
              <BaseText typography={Typography.bodyMedium.small}>Khác</BaseText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  });
export default MyActiveStory;
