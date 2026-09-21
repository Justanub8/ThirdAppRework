import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Theme } from '~/hooks';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import { CrossIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';

const CameraScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const photoOutput = usePhotoOutput({
    previewImageTargetSize: { width: 100, height: 150 },
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleTakePhoto = async () => {
    try {
      const photo = await photoOutput.capturePhoto(
        {},
        {
          onWillCapturePhoto: () => console.log('about to capture'),
          onDidCapturePhoto: () => console.log('did capture'),
          onPreviewImageAvailable: (image) => {
            console.log('Received image');
          },
        }
      );
    } catch (error) {
      console.error('Lỗi chụp ảnh:', error);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <BaseText typography={Typography.bodyMedium.large}>
          Ứng dụng cần quyền truy cập Camera
        </BaseText>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <BaseText color="#FFFFFF">Cấp quyền Camera</BaseText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.black} />
        <BaseText style={{ marginTop: 12 }}>Đang tìm thiết bị Camera...</BaseText>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        isActive={true}
        device={device}
        outputs={[photoOutput]}
      />
      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <TouchableOpacity style={styles.closeButton} onPress={() => Navigation.pop()}>
          <CrossIcon width={28} height={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.bottomOverlay}>
        <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto} activeOpacity={0.7}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
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
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomOverlay: {
      position: 'absolute',
      bottom: 24,
      left: 0,
      right: 0,
      zIndex: 10,
      alignItems: 'center',
    },
    captureButton: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 4,
      borderColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#FFFFFF',
    },
  });

export default CameraScreen;