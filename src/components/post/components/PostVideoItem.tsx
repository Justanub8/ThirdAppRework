import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseVideo, BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';

interface PostVideoItemProps {
  url?: string;
  isPaused: boolean;
}

export const PostVideoItem: React.FC<PostVideoItemProps> = ({ url, isPaused }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (hasError) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
        <BaseText color="#FFFFFF" typography={Typography.bodyMedium.medium}>
          Không thể phát nội dung
        </BaseText>
      </View>
    );
  }

  return (
    <BaseVideo
      uri={url}
      style={StyleSheet.absoluteFill}
      resizeMode="contain"
      repeat={true}
      paused={isPaused}
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostVideoItem;
