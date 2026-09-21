import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import type { OnLoadEvent } from '@d11/react-native-fast-image';
import { FastImage } from '~/components/rn-components';
import { formatMediaUrl } from '~/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_MEDIA_WIDTH = Math.round(SCREEN_WIDTH * 0.58);

interface MessageImageItemProps {
  url: string;
  targetWidth?: number;
  style?: any;
  onPress?: () => void;
}

export const MessageImageItem: React.FC<MessageImageItemProps> = ({
  url,
  targetWidth = DEFAULT_MEDIA_WIDTH,
  style,
  onPress,
}) => {
  const [dimensions, setDimensions] = useState({
    width: targetWidth,
    height: targetWidth,
  });

  const formattedUrl = formatMediaUrl(url);

  const calculateAndSetDimensions = (w: number, h: number) => {
    if (w > 0 && h > 0) {
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

  useEffect(() => {
    setDimensions({
      width: targetWidth,
      height: targetWidth,
    });
    if (formattedUrl) {
      Image.getSize(
        formattedUrl,
        (w, h) => calculateAndSetDimensions(w, h),
        () => {}
      );
    }
  }, [formattedUrl, targetWidth]);

  const handleLoad = (event: OnLoadEvent) => {
    if (event?.nativeEvent?.width && event?.nativeEvent?.height) {
      calculateAndSetDimensions(event.nativeEvent.width, event.nativeEvent.height);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.container,
        style,
        { width: dimensions.width, height: dimensions.height },
      ]}
    >
      <FastImage
        source={{ uri: url }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onLoad={handleLoad}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
  },
});

export default MessageImageItem;
