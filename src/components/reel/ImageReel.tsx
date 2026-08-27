import { View, StyleSheet, ImageBackground } from 'react-native';
import React from 'react';
import ReelOverlay from './ReelOverlay';
import { IReel } from '~/interfaces/reel';

type ImageReelProps = {
  reel: IReel;
};

const ImageReel = ({ reel }: ImageReelProps) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: reel.media?.url }}
        style={StyleSheet.absoluteFill}
        resizeMode='contain'
      >
        <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />
      </ImageBackground>
      
      <ReelOverlay reel={reel} progress={1} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

export default ImageReel;
