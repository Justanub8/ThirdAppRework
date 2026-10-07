import { Alert, Platform } from 'react-native';
import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { createThumbnail } from 'react-native-create-thumbnail';

// Định dạng video và regex hỗ trợ
export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'm4v'] as const;
export const VIDEO_REGEX = /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i;
export const IMAGE_REGEX = /\.(jpe?g|png|webp|gif|heic|heif)(\?.*)?$/i;

export const formatDuration = (seconds?: number | null): string => {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const isVideoMedia = (
  media?: unknown,
  fileName?: string,
  isVideoHint?: boolean,
): boolean => {
  if (isVideoHint) return true;
  if (!media && !fileName) return false;

  if (typeof media === 'string') {
    if (VIDEO_REGEX.test(media)) return true;
    if (fileName && VIDEO_REGEX.test(fileName)) return true;
    return false;
  }
  if (typeof media === 'object' && media !== null) {
    const m = media as {
      playableDuration?: number;
      type?: string;
      uri?: string;
      url?: string;
      filename?: string;
    };
    if (m.playableDuration && m.playableDuration > 0) return true;
    if (typeof m.type === 'string') {
      const lowerType = m.type.toLowerCase();
      if (lowerType === 'video' || lowerType.startsWith('video/')) return true;
    }
    if (m.uri && VIDEO_REGEX.test(m.uri)) return true;
    if (m.url && VIDEO_REGEX.test(m.url)) return true;
    if (m.filename && VIDEO_REGEX.test(m.filename)) return true;
  }

  if (fileName && VIDEO_REGEX.test(fileName)) return true;
  return false;
};

export const getMediaMimeType = (
  uri: string,
  customFilename?: string,
  isExplicitVideo?: boolean,
): string => {
  const cleanUri = uri.split('?')[0];
  const rawName = customFilename || cleanUri.split('/').pop() || '';
  const match = /\.(\w+)$/.exec(rawName);
  const ext = match ? match[1].toLowerCase() : (isExplicitVideo ? 'mp4' : 'jpg');
  const isVideo = isExplicitVideo || (VIDEO_EXTENSIONS as readonly string[]).includes(ext);

  if (isVideo) {
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'mp4') return 'video/mp4';
    return `video/${ext}`;
  }

  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
};

export const formatMediaUrl = (url?: string): string => {
  if (!url) return '';

  const minioPattern = /https?:\/\/[^/]+:9000\/[^/]+\/(.+)$/;
  const minioMatch = url.match(minioPattern);

  if (minioMatch) {
    const key = minioMatch[1];
    const baseApi = (Config.BASE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');

    if (baseApi && (baseApi.startsWith('https://') || !baseApi.includes(':5050'))) {
      return `${baseApi}/media/file/${key}`;
    }

    let host = 'localhost';
    if (baseApi) {
      try {
        const match = baseApi.match(/https?:\/\/([^:/]+)/);
        if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
          host = match[1];
        }
      } catch {}
    }

    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      host = '10.0.2.2';
    }

    return url.replace(/localhost:9000|127\.0\.0\.1:9000/, `${host}:9000`);
  }

  if (url.includes('localhost:9000') || url.includes('127.0.0.1:9000')) {
    const baseApi = (Config.BASE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
    if (baseApi && baseApi.startsWith('https://')) {
      const parts = url.split(/social-media\//);
      if (parts.length > 1) {
        return `${baseApi}/media/file/${parts[1]}`;
      }
    }
  }

  return url;
};

export const resolveLocalMediaUri = async (
  uri: string,
  fileName?: string,
  isVideoHint?: boolean,
): Promise<string> => {
  if (uri.startsWith('file://')) {
    return uri;
  }

  const isVideo = isVideoMedia(uri, fileName, isVideoHint);
  const extMatch = /\.(\w+)(\?.*)?$/.exec(uri);
  const ext = extMatch ? `.${extMatch[1]}` : (isVideo ? '.mp4' : '.jpg');
  const name = fileName || `${isVideo ? 'video' : 'media'}_${Date.now()}${ext.startsWith('.') ? ext : `.${ext}`}`;
  const destPath = `${RNFS.CachesDirectoryPath}/${name}`;

  try {
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      await RNFS.copyFile(uri, destPath);
      return `file://${destPath}`;
    }

    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      if (isVideo) {
        try {
          if (RNFS.copyAssetsVideoIOS) {
            const copiedPath = await RNFS.copyAssetsVideoIOS(uri, destPath);
            if (copiedPath) {
              return copiedPath.startsWith('file://') ? copiedPath : `file://${copiedPath}`;
            }
          }
        } catch (videoErr) {
          console.log('Error copyAssetsVideoIOS:', videoErr);
        }
      }

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
      if (isVideo && RNFS.copyAssetsVideoIOS) {
        try {
          const copiedPath = await RNFS.copyAssetsVideoIOS(uri, destPath);
          return copiedPath.startsWith('file://') ? copiedPath : `file://${copiedPath}`;
        } catch (videoErr) {
          console.log('Error copyAssetsVideoIOS from assets-library:', videoErr);
        }
      }
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

export interface NormalizedMediaAsset {
  uri: string;
  filename?: string | null;
  extension?: string | null;
  type: 'image' | 'video';
  playableDuration?: number | null;
  width?: number;
  height?: number;
}

export interface FetchDeviceMediaResult {
  photos: NormalizedMediaAsset[];
  hasNextPage: boolean;
  endCursor?: string;
}

export const fetchDeviceMedia = async (
  after?: string,
  first: number = 16,
  assetType: 'All' | 'Photos' | 'Videos' = 'All',
): Promise<FetchDeviceMediaResult> => {
  try {
    const res = await CameraRoll.getPhotos({
      first,
      after,
      assetType,
    });

    const photos: NormalizedMediaAsset[] = res.edges.map((edge) => {
      const image = edge.node.image;
      const isVideo = isVideoMedia(image);

      return {
        ...image,
        uri: image.uri,
        filename: image.filename || undefined,
        extension: image.extension || undefined,
        type: isVideo ? 'video' : 'image',
        playableDuration: image.playableDuration || undefined,
        width: image.width,
        height: image.height,
      };
    });

    return {
      photos,
      hasNextPage: res.page_info.has_next_page,
      endCursor: res.page_info.end_cursor,
    };
  } catch (error) {
    console.log('Error fetchDeviceMedia:', error);
    return { photos: [], hasNextPage: false };
  }
};

export async function uploadMediaFromUri(
  uri: string,
  mediaType: 'photo' | 'video' | 'image',
  getUploadUrlFn?: (fileName: string, contentType: string) => Promise<{ uploadUrl: string; key: string }>,
): Promise<{ key: string; uploadUrl: string; contentType: string; fileName: string }> {
  const isVideo = mediaType === 'video' || mediaType === 'photo' ? mediaType === 'video' : isVideoMedia(uri);
  const ext =
    uri.match(/\.(\w+)(\?.*)?$/)?.[1]?.toLowerCase() ||
    (isVideo ? 'mp4' : 'jpg');
  const contentType = getMediaMimeType(uri, undefined, isVideo);
  const fileName = `${Date.now()}.${ext}`;

  const localUri = await resolveLocalMediaUri(uri, fileName, isVideo);

  let uploadUrl = '';
  let key = '';

  if (getUploadUrlFn) {
    const res = await getUploadUrlFn(fileName, contentType);
    uploadUrl = res.uploadUrl;
    key = res.key;
  } else {
    const { mediaApi } = await import('~/api');
    const res = await mediaApi.getUploadUrl({ filename: fileName, contentType });
    uploadUrl = res.data.uploadUrl;
    key = res.data.key;
  }

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

  if (localUri.startsWith(`file://${RNFS.CachesDirectoryPath}`)) {
    RNFS.unlink(localUri.replace('file://', '')).catch(() => {});
  }

  return { key, uploadUrl, contentType, fileName };
}

const thumbnailCache = new Map<string, string>();

export const getVideoThumbnail = async (url?: string): Promise<string | null> => {
  if (!url) return null;
  const formattedUrl = formatMediaUrl(url);
  if (thumbnailCache.has(formattedUrl)) {
    return thumbnailCache.get(formattedUrl)!;
  }
  try {
    const res = await createThumbnail({
      url: formattedUrl,
      timeStamp: 100,
    });
    if (res?.path) {
      thumbnailCache.set(formattedUrl, res.path);
      return res.path;
    }
  } catch {
  }
  return null;
};

export const saveMediaToDevice = async (
  mediaUrl: string,
  mediaType: 'image' | 'video' = 'image',
): Promise<boolean> => {
  try {
    const fullUrl = formatMediaUrl(mediaUrl);
    const cleanUrl = mediaUrl.split('?')[0];
    const match = cleanUrl.match(/\.([a-zA-Z0-9]+)$/);
    const urlExt = match ? match[1].toLowerCase() : '';

    let ext = mediaType === 'video' ? 'mp4' : 'jpg';
    if (mediaType === 'video') {
      if (['mp4', 'mov', 'webm', 'm4v', '3gp', 'avi'].includes(urlExt)) {
        ext = urlExt;
      }
    } else {
      if (['webp', 'jpg', 'jpeg', 'png', 'gif', 'heic'].includes(urlExt)) {
        ext = urlExt;
      }
    }

    const tempPath = `${RNFS.CachesDirectoryPath}/download_${Date.now()}.${ext}`;
    const downloadResult = await RNFS.downloadFile({
      fromUrl: fullUrl,
      toFile: tempPath,
    }).promise;

    if (downloadResult.statusCode !== 200 && downloadResult.statusCode !== 206) {
      throw new Error('Tải file thất bại');
    }
    await CameraRoll.saveAsset(`file://${tempPath}`, {
      type: mediaType === 'video' ? 'video' : 'photo',
    });
    await RNFS.unlink(tempPath).catch(() => {});
    Alert.alert(
      'Thành công',
      mediaType === 'video'
        ? 'Đã lưu video vào bộ sưu tập!'
        : 'Đã lưu ảnh vào bộ sưu tập!',
    );
    return true;
  } catch (error) {
    console.log('Lỗi không tải được media:', error);
    Alert.alert('Lỗi', 'Không thể lưu nội dung về máy. Vui lòng thử lại sau.');
    return false;
  }
};