import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossIcon, DownloadIcon, MenuIcon } from '~/assets/svgs';
import {
  formatDuration,
  Navigation,
  getVideoThumbnail,
  saveMediaToDevice,
} from '~/utils';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Theme, useTheme } from '~/hooks';
import { BaseText, BaseVideo, FastImage } from '~/components/rn-components';
import { Typography } from '~/constants';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'DetailMedia'>;
const DetailMedia = () => {
  const { width } = Dimensions.get('window');
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const route = useRoute<RouteProps>();
  const { uri, mediaType, thumbnail } = route.params;
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [posterUri, setPosterUri] = useState<string | undefined>(thumbnail);

  useEffect(() => {
    if (!posterUri && mediaType === 'video') {
      getVideoThumbnail(uri).then(path => {
        if (path) setPosterUri(path);
      });
    }
  }, [uri, mediaType, posterUri]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolbar}>
        <CrossIcon
          width={36}
          height={36}
          color={theme.text}
          onPress={() => Navigation.pop()}
        />
        <View style={styles.rightActions}>
          <DownloadIcon
            width={24}
            height={24}
            color={theme.text}
            onPress={() => saveMediaToDevice(uri, mediaType)}
          />
          <MenuIcon width={30} height={30} color={theme.text} />
        </View>
      </View>
      <View style={styles.mediaContainer}>
        {mediaType === 'video' ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsPaused(prev => !prev)}
            style={StyleSheet.absoluteFill}
          >
            <BaseVideo
              uri={uri}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              repeat={true}
              paused={isPaused}
              onReadyForDisplay={() => setIsReady(true)}
              onLoad={data => {
                setIsReady(true);
                setDuration(data.duration);
              }}
              onProgress={data => {
                if (duration > 0) setProgress(data.currentTime / duration);
              }}
            />
            {!isReady && posterUri ? (
              <FastImage
                source={{
                  uri:
                    posterUri.startsWith('file://') ||
                    posterUri.startsWith('http')
                      ? posterUri
                      : `file://${posterUri}`,
                }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            ) : null}
            {!isReady ? (
              <View
                style={[StyleSheet.absoluteFill, styles.loadingOverlay]}
                pointerEvents="none"
              >
                <ActivityIndicator size="small" color={theme.text} />
              </View>
            ) : null}
          </TouchableOpacity>
        ) : (
          <FastImage
            source={{ uri: uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        )}
      </View>
      {mediaType === 'video' ? (
        <View>
          <View
            style={[styles.progressBarTrack, { width: progress * width }]}
          />
          <View style={styles.durationRow}>
            <BaseText typography={Typography.bodyRegular.small}>
              {formatDuration(progress * duration) || '0:00'}
            </BaseText>
            <BaseText typography={Typography.bodyRegular.small}>
              {formatDuration(duration)}
            </BaseText>
          </View>
        </View>
      ) : null}
      <View style={styles.bottomSpacer} pointerEvents="none" />
    </SafeAreaView>
  );
};

const TOOLBAR_HEIGHT = 40;

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    toolbar: {
      height: TOOLBAR_HEIGHT,
      flexDirection: 'row',
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rightActions: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },
    mediaContainer: {
      flex: 1,
      marginHorizontal: 16,
      justifyContent: 'center',
      borderRadius: 16,
    },
    loadingOverlay: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.overlayBlack30,
    },
    progressBarTrack: {
      height: 4,
      backgroundColor: theme.text,
    },
    durationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    bottomSpacer: {
      height: TOOLBAR_HEIGHT,
    },
  });
export default DetailMedia;
