import React, { forwardRef, useMemo } from 'react';
import Video, { VideoRef, ReactVideoProps, ReactVideoSource, BufferConfig } from 'react-native-video';
import { formatMediaUrl } from '~/utils';

export interface BaseVideoProps extends Omit<ReactVideoProps, 'source'> {
  uri?: string;
  source?: ReactVideoSource;
  bufferConfig?: BufferConfig;
}

const DEFAULT_BUFFER_CONFIG: BufferConfig = {
  minBufferMs: 5000,
  maxBufferMs: 15000,
  bufferForPlaybackMs: 1500,
  bufferForPlaybackAfterRebufferMs: 2500,
  cacheSizeMB: 100, 
};

const BaseVideo = forwardRef<VideoRef, BaseVideoProps>((props, ref) => {
  const { uri, source, bufferConfig, ...rest } = props;

  const mergedBufferConfig = useMemo<BufferConfig>(() => {
    return {
      ...DEFAULT_BUFFER_CONFIG,
      ...bufferConfig,
    };
  }, [bufferConfig]);

  const formattedSource = useMemo<ReactVideoSource>(() => {
    if (uri) {
      return {
        uri: formatMediaUrl(uri),
        bufferConfig: mergedBufferConfig,
      };
    }
    if (source && typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
      return {
        ...source,
        uri: formatMediaUrl(source.uri),
        bufferConfig: source.bufferConfig ?? mergedBufferConfig,
      };
    }
    return source || { uri: '' };
  }, [uri, source, mergedBufferConfig]);

  return (
    <Video
      ref={ref}
      source={formattedSource}
      {...rest}
    />
  );
});

BaseVideo.displayName = 'BaseVideo';

export default BaseVideo;
export { BaseVideo };
export type { VideoRef };