import React, { forwardRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { VideoRef } from 'react-native-video';
import { BaseVideo } from '~/components/rn-components';

export interface StoryVideoItemProps {
  url: string;
  style?: StyleProp<ViewStyle>;
  isPaused: boolean;
  onLoad?: (data: any) => void;
  onProgress?: (data: any) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export const StoryVideoItem = forwardRef<VideoRef, StoryVideoItemProps>((props, ref) => {
  const { url, style, isPaused, onLoad, onProgress, onEnd, onError } = props;

  return (
    <BaseVideo
      ref={ref}
      uri={url}
      style={style}
      resizeMode="contain"
      paused={isPaused}
      onLoad={onLoad}
      onProgress={onProgress}
      onEnd={onEnd}
      onError={onError}
    />
  );
});

StoryVideoItem.displayName = 'StoryVideoItem';

export default StoryVideoItem;
