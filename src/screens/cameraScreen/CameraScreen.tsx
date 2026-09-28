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
import {
  CrossIcon,
  FlashIcon,
  FlashOffIcon,
  RepostIcon,
} from '~/assets/svgs';
import { Navigation } from '~/utils';

const CameraScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraPosition);
  const camera = useRef<any>(null);

  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();

  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({
    enableAudio: hasMicPermission,
  });

  const recorderRef = useRef<any>(null);

  useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
    }
  }, [hasCameraPermission, requestCameraPermission]);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
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
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    if (!device?.hasFlash) {
      Alert.alert('Thông báo', 'Camera hiện tại không hỗ trợ đèn flash');
      return;
    }
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
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
          {}
        );

        const uri = photoFile.filePath.startsWith('file://')
          ? photoFile.filePath
          : `file://${photoFile.filePath}`;
        console.log(uri);
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
            (filePath) => {
              setIsRecording(false);
              recorderRef.current = null;
              const uri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
              Navigation.goToCreateStory(uri, 'video');
            },
            (error) => {
              console.error('Lỗi khi quay video:', error);
              setIsRecording(false);
              recorderRef.current = null;
              Alert.alert('Lỗi', 'Không thể quay video. Vui lòng thử lại.');
            }
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
        <BaseText typography={Typography.bodyMedium.large} color="#FFFFFF">
          Ứng dụng cần quyền truy cập Camera
        </BaseText>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <BaseText color="#FFFFFF">Cấp quyền Camera</BaseText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <BaseText style={{ marginTop: 12 }} color="#FFFFFF">
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
          <CrossIcon width={24} height={24} color="#FFFFFF" />
        </TouchableOpacity>
        {isRecording && (
          <View style={styles.timerBadge}>
            <View style={styles.timerDot} />
            <BaseText typography={Typography.bodyMedium.medium} color="#FFFFFF">
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
                <FlashIcon width={22} height={22} color="#FFD700" />
              ) : (
                <FlashOffIcon width={22} height={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.circleButton, { marginLeft: 12 }]}
            onPress={toggleCamera}
            disabled={isRecording}
          >
            <RepostIcon width={22} height={22} color="#FFFFFF" />
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
                color={mode === 'image' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
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
                color={mode === 'video' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
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
            <ActivityIndicator size="small" color="#FFFFFF" />
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

const getStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
      padding: 16,
    },
    permissionButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#3797EF',
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
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    timerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF3B30',
      marginRight: 6,
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
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      borderRadius: 20,
      padding: 4,
      marginBottom: 20,
    },
    modeTab: {
      paddingHorizontal: 18,
      paddingVertical: 6,
      borderRadius: 16,
    },
    modeTabActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonRecording: {
      borderColor: '#FF3B30',
    },
    captureButtonInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#FFFFFF',
    },
    captureButtonInnerVideo: {
      backgroundColor: '#FF3B30',
    },
    captureButtonInnerRecording: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: '#FF3B30',
    },
  });

export default CameraScreen;