import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

export type PickMediaType = 'all' | 'image' | 'video';

export interface PickedMedia {
  uri: string;
  type: 'image' | 'video';
  filename?: string | null;
  extension?: string | null;
  playableDuration?: number | null;
  width?: number;
  height?: number;
  selectionLimit?: number;
}

/**
 * Opens the OS-native photo/video picker (PHPicker on iOS, Photo Picker on
 * Android). Returns null if the user cancels or picking fails.
 * The returned uri is a local file:// copy, ready for upload.
 */
export const pickMedia = async (
  mediaType: PickMediaType = 'all',
  selectionLimit: number = 1
): Promise<PickedMedia | null> => {
  try {
    const res = await launchImageLibrary({
      mediaType:
        mediaType === 'image'
          ? 'photo'
          : mediaType === 'video'
          ? 'video'
          : 'mixed',
      selectionLimit: selectionLimit === 1 ? 1 : 0, // 0 = unlimited
      // Convert HEIC -> JPEG / HEVC -> H.264 on iOS so uploads are widely playable.
      assetRepresentationMode: 'compatible',
      formatAsMp4: true,
      quality: 1,
    });

    if (res.didCancel) return null;
    if (res.errorCode) {
      console.log('pickMedia error:', res.errorCode, res.errorMessage);
      if (res.errorCode === 'permission') {
        Alert.alert('Lỗi', 'Ứng dụng không có quyền truy cập thư viện ảnh.');
      }
      return null;
    }

    const asset = res.assets?.[0];
    if (!asset?.uri) return null;

    const isVideo =
      mediaType === 'video' ||
      (mediaType !== 'image' &&
        (asset.type?.startsWith('video/') || (asset.duration ?? 0) > 0));
    const extension = asset.fileName?.split('.').pop()?.toLowerCase() ?? null;

    return {
      uri: asset.uri,
      type: isVideo ? 'video' : 'image',
      filename: asset.fileName ?? null,
      extension,
      playableDuration: asset.duration ?? null,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.log('pickMedia exception:', error);
    return null;
  }
};
