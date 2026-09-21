import React, { forwardRef, useMemo } from 'react';
import Video, { VideoRef, ReactVideoProps, ReactVideoSource } from 'react-native-video';
import { formatMediaUrl } from '~/utils';

export interface BaseVideoProps extends Omit<ReactVideoProps, 'source'> {
  uri?: string;
  source?: ReactVideoSource;
}

const BaseVideo = forwardRef<VideoRef, BaseVideoProps>((props, ref) => {
  const { uri, source, ...rest } = props;

  const formattedSource = useMemo(() => {
    if (uri) {
      return { uri: formatMediaUrl(uri) };
    }
    if (source && typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
      return {
        ...source,
        uri: formatMediaUrl(source.uri),
      };
    }
    return source || { uri: '' };
  }, [uri, source]);

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
