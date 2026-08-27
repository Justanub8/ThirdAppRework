import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { VideoRef, Video } from 'react-native-video';
import ReelOverlay from './ReelOverlay';
import { IReel } from '~/interfaces/reel';
import { MutedIcon, PlayIcon, UnmutedIcon } from '~/assets/svgs';

type VideoReelProps = {
  reel: IReel;
  isActive: boolean;
};

const VideoReel = ({ reel, isActive }: VideoReelProps) => {
  const videoRef = useRef<VideoRef>(null);
  
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (data: any) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.container}>
      <View style={styles.videoControl}>
        <TouchableOpacity
          style={styles.touchSide}
          activeOpacity={1}
          onPressIn={() => setPlaySpeed(2)}
          onPressOut={() => setPlaySpeed(1)}
        />

        <TouchableOpacity
          style={styles.touchCenter}
          activeOpacity={1}
          onPress={togglePlayPause}
        />
        
        <TouchableOpacity
          style={styles.touchSide}
          activeOpacity={1}
          onPressIn={() => setPlaySpeed(2)}
          onPressOut={() => setPlaySpeed(1)}
        />
      </View>
      <Video
        ref={videoRef}
        source={{ uri: reel.media?.url }} 
        style={StyleSheet.absoluteFill}
        resizeMode='contain'
        paused={!isPlaying} 
        muted={isMuted}     
        repeat={true}
        onLoad={(meta) => setDuration(meta.duration)}
        onProgress={handleProgress}
        progressUpdateInterval={100}
        rate={playSpeed}
      />
      
      <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} pointerEvents="none" />

      {!isPlaying && (
        <View style={styles.centerControls} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.muteButton}
            onPress={() => setIsMuted(prev => !prev)}    
          >
            {isMuted ? (
              <MutedIcon height={40} width={40} color={'#FFFFFF'}/>
            ) : (
              <UnmutedIcon height={40} width={40} color={'#FFFFFF'}/>
            )}
          </TouchableOpacity>
          <View style={{ height: 24 }} />
          <PlayIcon style={styles.playButton} height={40} width={40} onPress={togglePlayPause}/>
        </View>
      )}

      <ReelOverlay reel={reel} progress={progress} />
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
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  muteButton: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  playButton: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  videoControl: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flex: 1,
    zIndex: 4,
  },
  touchSide: {
    width: '33%',
    height: '100%',
  },
  touchCenter: {
    flexGrow: 1,
    flex: 1,
    height: '100%',
  },
});

export default VideoReel;
