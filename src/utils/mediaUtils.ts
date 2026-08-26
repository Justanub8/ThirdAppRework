import { Platform } from 'react-native';
import Config from 'react-native-config';

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
        // Fallback to localhost
      }
    }

    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      host = '10.0.2.2';
    }

    return url.replace(/localhost:9000|127\.0\.0\.1:9000/, `${host}:9000`);
  }

  return url;
};
