import { View, StyleSheet, Dimensions } from 'react-native';
import { IReel } from '~/interfaces';
import { BaseVideo } from '~/components/rn-components';
import React, { useEffect, useRef, useState } from 'react';
import { VideoRef } from 'react-native-video';

type PreviewReelProps = {
  reel: IReel;
};

const PreviewVideoReel = ({ reel }: PreviewReelProps) => {
  const { height, width } = Dimensions.get('window');
  const videoRef = useRef<VideoRef>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [reel.media?.url]);

  return (
    <View style={{ width: width / 3, height: (width / 3) * (height / width) }}>
      {!hasError ? (
        <BaseVideo
          ref={videoRef}
          uri={reel.media?.url}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          muted={true}
          repeat={true}
          onLoadStart={() => setIsLoading(true)}
          onReadyForDisplay={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onBuffer={(data: any) => setIsLoading(Boolean(data?.isBuffering))}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#181818' }} />
      )}
    </View>
  );
};

export default PreviewVideoReel;