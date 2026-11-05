import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { BaseVideo } from '~/components/rn-components';

interface CreatePostVideoProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  isMuted: boolean;
  onError?: () => void;
}

export const CreatePostVideo: React.FC<CreatePostVideoProps> = ({
  uri,
  style,
  isMuted,
  onError,
}) => {
  return (
    <BaseVideo
      uri={uri}
      resizeMode="cover"
      style={style}
      repeat={true}
      paused={false}
      muted={isMuted}
      onError={onError}
    />
  );
};

export default CreatePostVideo;
