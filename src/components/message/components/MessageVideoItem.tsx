import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, StyleProp, ViewStyle } from 'react-native';
import type { OnLoadData } from 'react-native-video';
import { BaseVideo } from '~/components/rn-components';
import { PlayIcon } from '~/assets/svgs';
import { getVideoThumbnail } from '~/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_MEDIA_WIDTH = Math.round(SCREEN_WIDTH * 0.58);

const videoDimensionsCache = new Map<string, { width: number; height: number }>();
const videoThumbnailCache = new Map<string, string>();

interface MessageVideoItemProps {
  url: string;
  videoId?: string;
  targetWidth?: number;
  style?: StyleProp<ViewStyle>;
  isPaused?: boolean;
  repeat?: boolean;
  onTogglePlay?: (videoId: string) => void;
  onPress?: (thumbnail?: string) => void;
  onLongPress?: () => void;
}

export const MessageVideoItem: React.FC<MessageVideoItemProps> = ({
  url,
  videoId,
  targetWidth = DEFAULT_MEDIA_WIDTH,
  style,
  isPaused: controlledPaused,
  repeat = true,
  onTogglePlay,
  onPress,
  onLongPress,
}) => {
  const cachedDims = url ? videoDimensionsCache.get(url) : undefined;
  const cachedThumb = url ? videoThumbnailCache.get(url) : undefined;
  const [internalPaused, setInternalPaused] = useState(true);
  const [dimensions, setDimensions] = useState(() => ({
    width: cachedDims?.width || targetWidth,
    height: cachedDims?.height || targetWidth,
  }));
  const [thumbnailUri, setThumbnailUri] = useState<string | undefined>(cachedThumb);

  const effectivePaused =
    controlledPaused !== undefined ? controlledPaused : internalPaused;

  useEffect(() => {
    if (url && videoThumbnailCache.has(url)) {
      setThumbnailUri(videoThumbnailCache.get(url));
      return;
    }
    let isMounted = true;
    getVideoThumbnail(url).then(thumb => {
      if (isMounted && thumb) {
        if (url) videoThumbnailCache.set(url, thumb);
        setThumbnailUri(thumb);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [url]);

  useEffect(() => {
    if (url && videoDimensionsCache.has(url)) {
      setDimensions(videoDimensionsCache.get(url)!);
      return;
    }
    setDimensions({
      width: targetWidth,
      height: targetWidth,
    });
    setInternalPaused(true);
  }, [url, targetWidth]);

  const handleTogglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay(videoId || url);
    } else {
      setInternalPaused(prev => !prev);
    }
  };

  const handleLoad = (meta: OnLoadData) => {
    let w = meta?.naturalSize?.width || 0;
    let h = meta?.naturalSize?.height || 0;

    if (w > 0 && h > 0) {
      if (meta.naturalSize?.orientation === 'portrait' && w > h) {
        const tmp = w;
        w = h;
        h = tmp;
      }
      const ratio = w / h;
      const computedHeight = Math.round(targetWidth / ratio);
      const minHeight = Math.round(targetWidth * 0.5);
      const maxHeight = Math.round(targetWidth * 1.85);
      const clampedHeight = Math.min(
        Math.max(computedHeight, minHeight),
        maxHeight,
      );

      const newDims = {
        width: targetWidth,
        height: clampedHeight,
      };
      if (url) {
        videoDimensionsCache.set(url, newDims);
      }
      setDimensions(newDims);
    }
  };

  return (
    <View
      style={[
        styles.container,
        style,
        { width: dimensions.width, height: dimensions.height },
      ]}
    >
      <TouchableOpacity
        activeOpacity={onPress ? 0.9 : 1}
        disabled={!onPress && !onLongPress}
        onPress={() => onPress && onPress(thumbnailUri)}
        onLongPress={onLongPress}
        delayLongPress={250}
        style={StyleSheet.absoluteFill}
      >
        <BaseVideo
          uri={url}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          paused={effectivePaused}
          repeat={repeat}
          onLoad={handleLoad}
          onEnd={() => {
            if (!repeat && onTogglePlay) {
              onTogglePlay(videoId || url);
            } else if (!repeat) {
              setInternalPaused(true);
            }
          }}
        />
      </TouchableOpacity>

      { effectivePaused ? 
      <View style={styles.controlsOverlay} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTogglePlay}
          style={styles.playPauseButton}
        >
          <PlayIcon width={24} height={24} color="#FFFFFF" style={styles.playIcon} />
        </TouchableOpacity>
      </View> :
        null
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 3,
  },
  pauseIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pauseBar: {
    width: 3.5,
    height: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

export default MessageVideoItem;
