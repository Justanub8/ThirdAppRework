import { Platform } from 'react-native';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { mediaApi } from '~/api';

export const formatMediaUrl = (url?: string): string => {
  if (!url) return '';

  if (url.includes('localhost:9000') || url.includes('127.0.0.1:9000')) {
    let host = 'localhost';

    if (Config.BASE_API_URL) {
      try {
        const match = Config.BASE_API_URL.match(/https?:\/\/([^:/]+)/);
        if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
          host = match[1];
        }
      } catch {
      }
    }

    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      host = '10.0.2.2';
    }

    return url.replace(/localhost:9000|127\.0\.0\.1:9000/, `${host}:9000`);
  }

  return url;
};

export const resolveLocalMediaUri = async (uri: string, fileName?: string): Promise<string> => {
  if (uri.startsWith('file://')) {
    return uri;
  }

  const extMatch = /\.(\w+)(\?.*)?$/.exec(uri);
  const ext = extMatch ? `.${extMatch[1]}` : '';
  const name = fileName || `media_${Date.now()}${ext}`;
  const destPath = `${RNFS.CachesDirectoryPath}/${name}`;

  try {
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      await RNFS.copyFile(uri, destPath);
      return `file://${destPath}`;
    }

    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      try {
        const asset = await CameraRoll.iosGetImageDataById(uri, { convertHeicImages: true });
        if (asset?.node?.image?.filepath) {
          return asset.node.image.filepath;
        }
      } catch (err) {
        console.log('Error getting image data by internal id:', err);
      }
    }

    if (
      Platform.OS === 'ios' &&
      uri.startsWith('assets-library://')
    ) {
      await RNFS.copyAssetsFileIOS(uri, destPath, 0, 0);
      return `file://${destPath}`;
    }

    await RNFS.copyFile(uri, destPath);
    return `file://${destPath}`;
  } catch (error) {
    console.log('Error resolving local media uri:', error);
    return uri;
  }
};

export async function uploadMediaFromUri(
  uri: string,
  mediaType: 'photo' | 'video' | 'image',
  getUploadUrlFn?: (fileName: string, contentType: string) => Promise<{ uploadUrl: string; key: string }>,
): Promise<{ key: string; uploadUrl: string; contentType: string; fileName: string }> {
  const ext =
    uri.match(/\.(\w+)(\?.*)?$/)?.[1]?.toLowerCase() ||
    (mediaType === 'video' ? 'mp4' : 'jpg');
  const contentType =
    mediaType === 'video'
      ? `video/${ext === 'mov' ? 'quicktime' : 'mp4'}`
      : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const fileName = `${Date.now()}.${ext}`;

  // 1. Resolve ph:// hoặc content:// -> file://
  const localUri = await resolveLocalMediaUri(uri, fileName);

  // 2. Lấy Presigned Upload URL
  let uploadUrl: string;
  let key: string;

  if (getUploadUrlFn) {
    const res = await getUploadUrlFn(fileName, contentType);
    uploadUrl = res.uploadUrl;
    key = res.key;
  } else {
    const res = await mediaApi.getUploadUrl({ filename: fileName, contentType });
    uploadUrl = res.data.uploadUrl;
    key = res.data.key;
  }

  // 3. Đọc blob và upload thẳng lên S3/MinIO
  const response = await fetch(localUri);
  const blob = await response.blob();

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });

  if (!res.ok) {
    throw new Error(`Upload thất bại: ${res.status}`);
  }

  // 4. Xoá file tạm trong Cache sau khi hoàn tất
  if (localUri.startsWith(`file://${RNFS.CachesDirectoryPath}`)) {
    RNFS.unlink(localUri.replace('file://', '')).catch(() => {});
  }

  return { key, uploadUrl, contentType, fileName };
}
