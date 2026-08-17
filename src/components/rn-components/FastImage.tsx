import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import FImage, {
  FastImageProps as FIProps,
  Source,
} from '@d11/react-native-fast-image';

export interface FastImageProps extends FIProps {
  trueSize?: boolean;
}

const FastImage = (props: FastImageProps) => {
  const [error, setError] = useState(false);
  const [trueSize, setTrueSize] = useState<
    {width: number; height: number} | undefined
  >();

  useEffect(() => {
    setError(false);
    
    const _source = props?.source as Source;
    if (_source?.uri && props.trueSize) {
      Image.getSize(_source?.uri).then(res => {
        setTrueSize(res);
      });
    } else {
      setTrueSize(undefined);
    }
  }, [props?.source, props.trueSize]);

  const source = error
    ? props.defaultSource
    : typeof props.source === 'number'
    ? props.source
    : (props.source && typeof props.source === 'object' && 'uri' in props.source)
    ? props.source
    : props.defaultSource;

  return (
    <FImage
      {...props}
      style={[
        props.style,
        props.trueSize &&
          trueSize && {aspectRatio: trueSize?.width / trueSize?.height},
      ]}
      source={source}
      onError={() => setError(true)}
    />
  );
};

export default FastImage;
