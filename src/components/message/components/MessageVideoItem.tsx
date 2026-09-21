import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import type { OnLoadData } from 'react-native-video';
import { BaseVideo } from '~/components/rn-components';
import { PlayIcon } from '~/assets/svgs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_MEDIA_WIDTH = Math.round(SCREEN_WIDTH * 0.58);

interface MessageVideoItemProps {
  url: string;
  videoId?: string;
  targetWidth?: number;
  style?: any;
  isPaused?: boolean;
  repeat?: boolean;
  onTogglePlay?: (videoId: string) => void;
}

export const MessageVideoItem: React.FC<MessageVideoItemProps> = ({
  url,
  videoId,
  targetWidth = DEFAULT_MEDIA_WIDTH,
  style,
  isPaused: controlledPaused,
  repeat = true,
  onTogglePlay,
}) => {
  const [internalPaused, setInternalPaused] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: targetWidth,
    height: targetWidth,
  });

  const effectivePaused = controlledPaused !== undefined ? controlledPaused : internalPaused;

  useEffect(() => {
    setDimensions({
      width: targetWidth,
      height: targetWidth,
    });
    setInternalPaused(true);
  }, [url, targetWidth]);

  const handlePress = () => {
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
      const clampedHeight = Math.min(Math.max(computedHeight, minHeight), maxHeight);

      setDimensions({
        width: targetWidth,
        height: clampedHeight,
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.container,
        style,
        { width: dimensions.width, height: dimensions.height },
      ]}
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
          }
        }}
      />
      {effectivePaused && (
        <View style={styles.playIconOverlay} pointerEvents="none">
          <PlayIcon width={32} height={32} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageVideoItem;
