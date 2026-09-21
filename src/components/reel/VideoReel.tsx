import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { VideoRef } from 'react-native-video';
import ReelOverlay from './ReelOverlay';
import { IReel } from '~/interfaces/reel';
import { MutedIcon, PlayIcon, UnmutedIcon } from '~/assets/svgs';
import { BaseText, BaseVideo } from '~/components/rn-components';
import { Typography } from '~/constants';

type VideoReelProps = {
  reel: IReel;
  isActive: boolean;
};

const VideoReel = ({ reel, isActive }: VideoReelProps) => {
  const videoRef = useRef<VideoRef>(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsPaused(false);
    setIsLoading(true);
  }, [reel.media?.url]);

  useEffect(() => {
    if (!isActive) {
      setIsPaused(false);
    }
  }, [isActive]);

  const togglePlayPause = () => {
    if (hasError) return;
    setIsPaused(prev => !prev);
  };

  const handleSpeedChange = (speed: number) => {
    if (hasError) return;
    setPlaySpeed(speed);
  };

  const handleProgress = (data: any) => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.container}>
      {!hasError && (
        <View style={styles.videoControl}>
          <TouchableOpacity
            style={styles.touchSide}
            activeOpacity={1}
            onPressIn={() => handleSpeedChange(2)}
            onPressOut={() => handleSpeedChange(1)}
          />

          <TouchableOpacity
            style={styles.touchCenter}
            activeOpacity={1}
            onPress={togglePlayPause}
          />
          
          <TouchableOpacity
            style={styles.touchSide}
            activeOpacity={1}
            onPressIn={() => handleSpeedChange(2)}
            onPressOut={() => handleSpeedChange(1)}
          />
        </View>
      )}

      {hasError ? (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          <BaseText color="#FFFFFF" typography={Typography.bodyMedium.medium}>
            Không thể phát nội dung
          </BaseText>
        </View>
      ) : (
        <BaseVideo
          ref={videoRef}
          uri={reel.media?.url} 
          style={StyleSheet.absoluteFill}
          resizeMode='contain'
          paused={!isActive || isPaused} 
          muted={isMuted}     
          repeat={true}
          onLoadStart={() => setIsLoading(true)}
          onReadyForDisplay={() => setIsLoading(false)}
          onLoad={(meta) => {
            setIsLoading(false);
            setDuration(meta.duration);
          }}
          onBuffer={(data: any) => setIsLoading(Boolean(data?.isBuffering))}
          onProgress={handleProgress}
          progressUpdateInterval={100}
          rate={playSpeed}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
      
      {!hasError && (
        <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} pointerEvents="none" />
      )}

      {isLoading && !hasError && isActive && !isPaused && (
        <View style={styles.centerLoading} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {!hasError && isActive && isPaused && (
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
  errorContainer: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLoading: {
    ...(StyleSheet.absoluteFill as object),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  centerControls: {
    ...(StyleSheet.absoluteFill as object),
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
    ...(StyleSheet.absoluteFill as object),
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
