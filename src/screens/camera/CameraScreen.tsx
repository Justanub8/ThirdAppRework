import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  usePhotoOutput,
  useVideoOutput,
} from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Theme } from '~/hooks';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import { CrossIcon, FlashIcon, FlashOffIcon, RepostIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';

const CameraScreen = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>(
    'back',
  );
  const device = useCameraDevice(cameraPosition);
  const camera = useRef<React.ElementRef<typeof Camera>>(null);

  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicPermission,
    requestPermission: requestMicPermission,
  } = useMicrophonePermission();

  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({
    enableAudio: hasMicPermission,
  });

  type VideoRecorder = Awaited<ReturnType<typeof videoOutput.createRecorder>>;
  const recorderRef = useRef<VideoRecorder | null>(null);

  useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
    }
  }, [hasCameraPermission, requestCameraPermission]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && isRecording) {
        recorderRef.current.cancelRecording?.();
      }
    };
  }, [isRecording]);

  const toggleCamera = () => {
    if (isRecording) return;
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    if (!device?.hasFlash) {
      Alert.alert('Thông báo', 'Camera hiện tại không hỗ trợ đèn flash');
      return;
    }
    setFlash(prev => (prev === 'off' ? 'on' : 'off'));
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCapture = async () => {
    if (mode === 'image') {
      if (isCapturing) return;
      try {
        setIsCapturing(true);
        const photoFile = await photoOutput.capturePhotoToFile(
          {
            flashMode: flash === 'on' && device?.hasFlash ? 'on' : 'off',
          },
          {},
        );

        const uri = photoFile.filePath.startsWith('file://')
          ? photoFile.filePath
          : `file://${photoFile.filePath}`;
        Navigation.goToCreateStory(uri, 'image');
      } catch (error) {
        console.error('Lỗi khi chụp ảnh:', error);
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      } finally {
        setIsCapturing(false);
      }
    } else {
      if (isRecording) {
        try {
          if (recorderRef.current) {
            await recorderRef.current.stopRecording();
          }
        } catch (error) {
          console.error('Lỗi khi dừng quay video:', error);
          setIsRecording(false);
          recorderRef.current = null;
        }
      } else {
        try {
          if (!hasMicPermission) {
            await requestMicPermission();
          }
          const recorder = await videoOutput.createRecorder({});
          recorderRef.current = recorder;
          setIsRecording(true);

          await recorder.startRecording(
            filePath => {
              setIsRecording(false);
              recorderRef.current = null;
              const uri = filePath.startsWith('file://')
                ? filePath
                : `file://${filePath}`;
              Navigation.goToCreateStory(uri, 'video');
            },
            error => {
              console.error('Lỗi khi quay video:', error);
              setIsRecording(false);
              recorderRef.current = null;
              Alert.alert('Lỗi', 'Không thể quay video. Vui lòng thử lại.');
            },
          );
        } catch (error) {
          console.error('Lỗi khi bắt đầu quay video:', error);
          setIsRecording(false);
          recorderRef.current = null;
          Alert.alert('Lỗi', 'Không thể bắt đầu quay video.');
        }
      }
    }
  };

  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <BaseText typography={Typography.bodyMedium.large} color={theme.white}>
          Ứng dụng cần quyền truy cập Camera
        </BaseText>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <BaseText color={theme.white}>Cấp quyền Camera</BaseText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.white} />
        <BaseText style={styles.loadingText} color={theme.white}>
          Đang tìm thiết bị Camera...
        </BaseText>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        isActive={true}
        device={device}
        outputs={[photoOutput, videoOutput]}
      />
      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => Navigation.pop()}
          disabled={isRecording}
        >
          <CrossIcon width={24} height={24} color={theme.white} />
        </TouchableOpacity>
        {isRecording && (
          <View style={styles.timerBadge}>
            <View style={styles.timerDot} />
            <BaseText
              typography={Typography.bodyMedium.medium}
              color={theme.white}
            >
              {formatTimer(recordingSeconds)}
            </BaseText>
          </View>
        )}

        <View style={styles.topRightActions}>
          {device.hasFlash && (
            <TouchableOpacity
              style={styles.circleButton}
              onPress={toggleFlash}
              disabled={isRecording}
            >
              {flash === 'on' ? (
                <FlashIcon width={22} height={22} color={theme.gold} />
              ) : (
                <FlashOffIcon width={22} height={22} color={theme.white} />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.circleButtonWithMargin}
            onPress={toggleCamera}
            disabled={isRecording}
          >
            <RepostIcon width={22} height={22} color={theme.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottomOverlay}>
        {!isRecording && (
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'image' && styles.modeTabActive]}
              onPress={() => setMode('image')}
            >
              <BaseText
                typography={Typography.bodyMedium.medium}
                color={mode === 'image' ? theme.white : theme.overlayWhite60}
              >
                Ảnh
              </BaseText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'video' && styles.modeTabActive]}
              onPress={() => setMode('video')}
            >
              <BaseText
                typography={Typography.bodyMedium.medium}
                color={mode === 'video' ? theme.white : theme.overlayWhite60}
              >
                Video
              </BaseText>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.captureButton,
            isRecording && styles.captureButtonRecording,
          ]}
          onPress={handleCapture}
          activeOpacity={0.7}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <View
              style={[
                styles.captureButtonInner,
                mode === 'video' && styles.captureButtonInnerVideo,
                isRecording && styles.captureButtonInnerRecording,
              ]}
            />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.black,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.black,
      padding: 16,
    },
    loadingText: {
      marginTop: 12,
    },
    permissionButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.primaryBlue,
      borderRadius: 8,
    },
    topOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingHorizontal: 16,
      paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    topRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    circleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.overlayBlack40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circleButtonWithMargin: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.overlayBlack40,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },
    timerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.overlayBlack40,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    timerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.errorRed,
      marginRight: 8,
    },
    bottomOverlay: {
      position: 'absolute',
      bottom: 24,
      left: 0,
      right: 0,
      zIndex: 10,
      alignItems: 'center',
    },
    modeSelector: {
      flexDirection: 'row',
      backgroundColor: theme.overlayBlack40,
      borderRadius: 20,
      padding: 4,
      marginBottom: 20,
    },
    modeTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
    },
    modeTabActive: {
      backgroundColor: theme.overlayWhite25,
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonRecording: {
      borderColor: theme.errorRed,
    },
    captureButtonInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.white,
    },
    captureButtonInnerVideo: {
      backgroundColor: theme.errorRed,
    },
    captureButtonInnerRecording: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.errorRed,
    },
  });

export default CameraScreen;
