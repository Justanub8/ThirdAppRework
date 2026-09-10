import { View, Text, StyleSheet,TouchableOpacity } from 'react-native'
import React, {useCallback, useState, useEffect, useRef } from 'react'
import { Theme, useAuthStore, useTheme } from '~/hooks'
import { useQuery } from '@tanstack/react-query';
import { storyApi } from '~/api';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BaseText, FastImage } from '~/components/rn-components';
import { Typography } from '~/constants';
import { CrossIcon, MenuIcon, MessageLightIcon, PersonWithShadowIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';
import Video, { VideoRef } from 'react-native-video';
import { MultiProgressBar } from './components/MultipleProgressBar';
import { Avatar } from '~/components/avatar';
import { timeAgo } from '~/utils';

const IMAGE_STORY_DURATION_MS = 5 * 1000;

const MyActiveStory = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { user } = useAuthStore();
    const { top, bottom } = useSafeAreaInsets();
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
        queryKey:['my-story'],
        queryFn: async () => {
            const res = await storyApi.getAllStories(1,20,user?.id);
            return res.data?.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const totalStories = stories.length;
    const currentStory = stories[activeIndex];
    const isVideo = currentStory?.media?.type === 'video';

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleNext = useCallback(() => {
        if( activeIndex < totalStories - 1){
            setActiveIndex((prev) => prev + 1);
            setProgress(0);
            setDuration(1);
        } else {
            Navigation.goBack();
        }
    }, [activeIndex, totalStories]);

    const handlePrevious = useCallback(() => {
        if(activeIndex > 0){
            setActiveIndex((prev) => prev - 1);
            setProgress(0);
            setDuration(1);
        }else{
            Navigation.goBack();
        }
    }, [activeIndex]);

    useEffect(() => {
        if(!currentStory || isVideo || isPaused ){
            if(imageTimerRef.current) clearInterval(imageTimerRef.current);
            return;
        }

        const intervalTime = 50;
        const step = intervalTime / IMAGE_STORY_DURATION_MS

        imageTimerRef.current = setInterval(() => {
            setProgress((prev) => {
                const nextProgress = prev + step;
                if(nextProgress >= 1){
                    if(imageTimerRef.current) clearInterval(imageTimerRef.current);
                    handleNext();
                    return 0;
                }
                return nextProgress;
            });
        }, intervalTime);
        
        return () => {
            if(imageTimerRef.current) clearInterval(imageTimerRef.current)
        }
    }, [currentStory, isVideo, isPaused, handleNext]);

    const mediaUrl = currentStory?.media?.url;
    const author = currentStory?.user;
    const createdAt = currentStory?.createdAt;

    return(
    <View style={styles.container}>
      <View style={styles.mediaWrapper}>
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
              style={styles.media}
              resizeMode="contain"
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
            style={styles.media}
            resizeMode="contain"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#181818', justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
              <BaseText color="#888888" typography={Typography.bodyMedium.medium} style={{ textAlign: 'center' }}>
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
                    Tin của bạn
                </BaseText>
                <BaseText color="#FFFFFF" typography={Typography.bodyRegular.small}>
                    {timeAgo(createdAt)}
                </BaseText>
            </View>
          <TouchableOpacity onPress={() => Navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CrossIcon width={28} height={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.footerBar, { bottom: bottom + 8 }]}>
        <View style={{justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <TouchableOpacity style={styles.icon}>
                <PersonWithShadowIcon width={32} height={32}/>
                <BaseText typography={Typography.bodyMedium.small}>Hoạt động</BaseText>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
                <TouchableOpacity style={styles.icon}>
                    <MessageLightIcon width={32} height={32}/>
                    <BaseText typography={Typography.bodyMedium.small}>Tin nổi bật</BaseText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon}>
                    <MessageLightIcon width={32} height={32}/>
                    <BaseText typography={Typography.bodyMedium.small}>Nhắc đến</BaseText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon}>
                    <MessageLightIcon width={32} height={32}/>
                    <BaseText typography={Typography.bodyMedium.small}>Gửi</BaseText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon}>
                    <MenuIcon width={32} height={32}/>
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
      backgroundColor: '#000000',
    },
    mediaWrapper: {
      zIndex: 0,
      ...StyleSheet.absoluteFill,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
    },
    media: {
      width: '100%',
      height: '100%',
      zIndex: -1
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
    icon:{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
  });
export default MyActiveStory