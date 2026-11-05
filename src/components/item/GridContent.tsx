import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React, { useRef } from 'react';
import { BaseVideo, VideoRef, FastImage } from '~/components/rn-components';
import { PlayIcon } from '~/assets/svgs';
import { isVideoMedia } from '~/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_MEDIA_WIDTH = Math.round(SCREEN_WIDTH / 3);
const DEFAULT_MEDIA_SCALE = 5 / 4;

interface GridContentProps {
  uri: string;
  mediaType?: 'image' | 'video' | string;
  /** Server-generated preview. When present, no video is loaded in the grid. */
  thumbnailUri?: string | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const GridContent = ({
  uri,
  mediaType,
  thumbnailUri,
  onPress,
  style,
}: GridContentProps) => {
  const videoRef = useRef<VideoRef>(null);
  const isVideo = mediaType === 'video' || isVideoMedia(uri);

  const handlePress = () => {
    videoRef.current?.pause();
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        {
          width: DEFAULT_MEDIA_WIDTH,
          height: DEFAULT_MEDIA_WIDTH * DEFAULT_MEDIA_SCALE,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {isVideo && thumbnailUri ? (
        <>
          <FastImage
            source={{ uri: thumbnailUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <PlayIcon
            width={16}
            height={16}
            color="#FFFFFF"
            style={styles.playIcon}
          />
        </>
      ) : isVideo ? (
        // Legacy media without a poster: fall back to a short muted preview.
        <BaseVideo
          ref={videoRef}
          uri={uri}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          muted={true}
          repeat={false}
          bufferConfig={{
            minBufferMs: 1000,
            maxBufferMs: 3000,
            bufferForPlaybackMs: 500,
          }}
          preferredForwardBufferDuration={3}
          onProgress={({ currentTime }) => {
            if (currentTime >= 3) {
              videoRef.current?.seek(0);
            }
          }}
        />
      ) : (
        <FastImage
          source={{ uri: thumbnailUri || uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});

export default GridContent;
