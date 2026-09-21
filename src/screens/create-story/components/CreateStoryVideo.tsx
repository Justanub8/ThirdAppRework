import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { BaseVideo } from '~/components/rn-components';

interface CreateStoryVideoProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  isMuted: boolean;
  onError?: () => void;
}

export const CreateStoryVideo: React.FC<CreateStoryVideoProps> = ({
  uri,
  style,
  isMuted,
  onError,
}) => {
  return (
    <BaseVideo
      uri={uri}
      resizeMode="contain"
      style={style}
      repeat={true}
      paused={false}
      muted={isMuted}
      onError={onError}
    />
  );
};

export default CreateStoryVideo;
