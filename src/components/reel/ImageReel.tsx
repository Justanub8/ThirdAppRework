import { View, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import ReelOverlay from './ReelOverlay';
import { IReel } from '~/interfaces/reel';
import { BaseText, FastImage } from '~/components/rn-components';
import { Typography } from '~/constants';
import { formatMediaUrl } from '~/utils';

type ImageReelProps = {
  reel: IReel;
};

const ImageReel = ({ reel }: ImageReelProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const rawUrl = reel.media?.url || (reel as any).videoUrl || (reel as any).mediaUrl || '';
  const mediaUrl = formatMediaUrl(rawUrl);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [rawUrl]);

  return (
    <View style={styles.container}>
      {/* Background cover image */}
      {mediaUrl && !hasError ? (
        <FastImage
          source={{ uri: mediaUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}

      {/* Dark blur overlay over background */}
      <View style={[StyleSheet.absoluteFill, styles.backdropOverlay]} pointerEvents="none" />

      {/* Main sharp image */}
      {mediaUrl && !hasError ? (
        <FastImage
          source={{ uri: mediaUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          <BaseText color="#FFFFFF" typography={Typography.bodyMedium.medium}>
            Không thể tải nội dung ảnh
          </BaseText>
        </View>
      )}

      {/* Subtle dark tint over image so overlays and captions pop */}
      {!hasError && (
        <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} pointerEvents="none" />
      )}

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <View style={styles.centerLoading} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      <ReelOverlay reel={reel} progress={1} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  backdropOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  errorContainer: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLoading: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
});

export default ImageReel;
