import React, { useEffect, useState } from 'react';
import { Image, ImageResizeMode } from 'react-native';
import FImage, {
  FastImageProps as FIProps,
  Source,
} from '@d11/react-native-fast-image';
import { formatMediaUrl } from '~/utils';

export interface FastImageProps extends FIProps {
  trueSize?: boolean;
}

const FastImage = (props: FastImageProps) => {
  const [error, setError] = useState(false);
  const [trueSize, setTrueSize] = useState<
    { width: number; height: number } | undefined
  >();

  let formattedSource = props.source;
  if (
    props.source &&
    typeof props.source === 'object' &&
    'uri' in props.source &&
    (props.source as Source).uri
  ) {
    formattedSource = {
      ...props.source,
      uri: formatMediaUrl((props.source as Source).uri),
    };
  }

  useEffect(() => {
    setError(false);

    const _source = formattedSource as Source;
    if (_source?.uri && props.trueSize) {
      Image.getSize(_source?.uri)
        .then(res => {
          setTrueSize(res);
        })
        .catch(() => {});
    } else {
      setTrueSize(undefined);
    }
  }, [props?.source, props.trueSize]);

  const rawUri =
    formattedSource &&
    typeof formattedSource === 'object' &&
    'uri' in formattedSource
      ? (formattedSource as Source).uri
      : undefined;

  if (error && rawUri) {
    return (
      <Image
        {...(props as any)}
        source={{ uri: rawUri }}
        style={[
          props.style,
          props.trueSize &&
            trueSize && { aspectRatio: trueSize.width / trueSize.height },
        ]}
        resizeMode={
          (props.resizeMode as unknown as ImageResizeMode) || 'contain'
        }
      />
    );
  }

  const source = error
    ? props.defaultSource
    : typeof formattedSource === 'number'
    ? formattedSource
    : rawUri
    ? formattedSource
    : props.defaultSource;

  return (
    <FImage
      {...props}
      style={[
        props.style,
        props.trueSize &&
          trueSize && { aspectRatio: trueSize?.width / trueSize?.height },
      ]}
      source={source}
      onError={() => setError(true)}
    />
  );
};

export default FastImage;
