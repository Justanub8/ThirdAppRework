import * as React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FastImage, BaseText } from '../rn-components';
import { images } from '~/assets/images';
import { Navigation } from '~/utils';
import { useTheme, useAuthStore } from '~/hooks';

export interface AvatarProps {
  url?: string | null;
  hasActiveStory?: boolean;
  isSeenStory?: boolean;
  id?: string;
  size: number;
  username?: string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  storyUserIds?: string[];
}

const STORY_GRADIENT_COLORS = [
  '#FFDC80',
  '#FCAF45',
  '#F77737',
  '#F56040',
  '#ff022e',
  '#E1306C',
  '#e300c8',
  '#833AB4',
  ];

const SEEN_STORY_COLORS = ['#8E8E93', '#C7C7CC'];

const Avatar: React.FC<AvatarProps> = ({
  url,
  hasActiveStory = false,
  isSeenStory = false,
  id = '',
  size = 40,
  username,
  disabled = false,
  onPress,
  style,
  storyUserIds,
}) => {
  const { theme } = useTheme();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const imageSource = React.useMemo(() => {
    if (!url) return images.avater_random;
    if (typeof url === 'string') return { uri: url };
    return url;
  }, [url]);



  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (!id) return;
    if (hasActiveStory) {
      if (currentUserId && id === currentUserId) {
        Navigation.goToMyActiveStory();
      } else {
        Navigation.goToStory(id, storyUserIds);
      }
      return;
    }
    if (currentUserId && id === currentUserId) {
      Navigation.goToProfile();
      return;
    }
    Navigation.goToUserProfile(id);
  };

  const gapWidth = Math.max(2, Math.round(size * 0.04));
  const innerSize = size - gapWidth * 2;

  const renderAvatarImage = () => {
    if (hasActiveStory) {
      const gradientColors = isSeenStory ? SEEN_STORY_COLORS : STORY_GRADIENT_COLORS;
      return (
        <LinearGradient
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          colors={gradientColors}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 1.0, y: 0.0 }}
        >
          <View
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              borderWidth: gapWidth,
              borderColor: theme.background,
              overflow: 'hidden',
              backgroundColor: theme.background,
            }}
          >
            <FastImage
              source={imageSource}
              resizeMode="cover"
              style={{ width: '100%', height: '100%', borderRadius: 9999 }}
            />
          </View>
        </LinearGradient>
      );
    }

    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: theme.surface || '#2a2a2a',
        }}
      >
        <FastImage
          source={imageSource}
          resizeMode="cover"
          style={[{ width: '100%', height: '100%', borderRadius: size / 2 }]}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || !id}
      style={[styles.container, style]}
    >
      {renderAvatarImage()}

      {username ? (
        <BaseText
          style={[styles.username, { color: theme.text, maxWidth: size + 28 }]}
          numberOfLines={1}
        >
          {username}
        </BaseText>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Avatar;