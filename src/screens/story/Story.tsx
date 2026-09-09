import { View, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '~/components/avatar';
import { CrossIcon, HeartIcon, MessageLightIcon, NotificationIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';
import { useTheme, Theme } from '~/hooks';
import { BaseText, BaseTextInput, FastImage } from '~/components/rn-components';
import { useQuery } from '@tanstack/react-query';
import { storyApi } from '~/api';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MultiProgressBar } from './MultipleProgressBar';
import { Video, VideoRef } from 'react-native-video';
import { Typography } from '~/constants';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'Story'>;

const IMAGE_STORY_DURATION_MS = 5000; 

const Story = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const route = useRoute<RouteProps>();
  const { top, bottom } = useSafeAreaInsets();
  const { userId } = route.params;

  const [isLiked, setIsLiked] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(1);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    setHasVideoError(false);
  }, [activeIndex]);

  const videoRef = useRef<VideoRef>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['story', userId],
    queryFn: async () => {
      const response = await storyApi.getAllStories(1, 20, userId);
      return response.data?.data || [];
    },
    enabled: !!userId,
  });

  const totalStories = stories.length;
  const currentStory = stories[activeIndex];
  const isVideo = currentStory?.media?.type === 'video';

  const handleNext = useCallback(() => {
    if (activeIndex < totalStories - 1) {
      setActiveIndex((prev) => prev + 1);
      setProgress(0);
      setDuration(1);
    } else {
      Navigation.goBack();
    }
  }, [activeIndex, totalStories]);

  const handlePrevious = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      setProgress(0);
      setDuration(1);
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
      setProgress((prev) => {
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

  const handleSend = () => {
    if (!messageContent.trim()) return;
    setMessageContent('');
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (totalStories === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <BaseText typography={Typography.bodyMedium.large}>Không có tin nào</BaseText>
        <TouchableOpacity style={styles.backButton} onPress={() => Navigation.goBack()}>
          <BaseText color={theme.blue}>Quay lại</BaseText>
        </TouchableOpacity>
      </View>
    );
  }

  const mediaUrl = currentStory?.media?.url;
  const author = currentStory?.user;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {isVideo && mediaUrl ? (
          hasVideoError ? (
            <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
              <BaseText color="#FFFFFF" typography={Typography.bodyMedium.medium}>
                Không thể phát nội dung
              </BaseText>
            </View>
          ) : (
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              paused={isPaused}
              onLoad={(data) => setDuration(data.duration || 1)}
              onProgress={(data) => {
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
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
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

      <SafeAreaView style={{flex: 1}} pointerEvents="box-none">
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
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
                <BaseText color="#FFFFFF" typography={Typography.bodyBold.medium}>
                {author?.username || 'user'}
                </BaseText>
            </View>
          <TouchableOpacity onPress={() => Navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CrossIcon width={28} height={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.footerBar, { bottom: bottom + 8 }]}>
        <View style={styles.messageInput}>
          <BaseTextInput
            placeholder="Gửi tin nhắn..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={messageContent}
            onChangeText={setMessageContent}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            color="#FFFFFF"
          />
        </View>
        <TouchableOpacity onPress={handleSend}>
          <MessageLightIcon width={26} height={26} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
          {isLiked ? (
            <HeartIcon width={28} height={28} color="#FF3040" />
          ) : (
            <NotificationIcon width={28} height={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    errorContainer: {
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
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
      marginTop: 18,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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
    messageInput: {
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
      borderRadius: 9999,
      height: 44,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
      flex: 1,
    },
  });

export default Story;