import { View, StyleSheet, ImageBackground } from 'react-native'
import React from 'react'
import ReelOverlay from './ReelOverlay'
import { IReel } from '~/interfaces/reel'
import { commonStyles } from '~/constants'

type ImageReelProps = {
  reel: IReel;
}

const ImageReel = ({ reel }: ImageReelProps) => {
  return (
    <View style={commonStyles.flex}>
      <ImageBackground
        source={{ uri: reel.media?.url }}
        style={StyleSheet.absoluteFill}
        resizeMode='contain'
      >
        {/* Optional dark overlay */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
      </ImageBackground>
      
      {/* UI Overlay with progress = 1 (100%) */}
      <ReelOverlay reel={reel} progress={1} />
    </View>
  )
}

export default ImageReel
