import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme, Theme } from '~/hooks';

interface MultiProgressBarProps {
  total: number;
  activeIndex: number;
  progress: SharedValue<number>;
}

const ActiveBarFill: React.FC<{
  progress: SharedValue<number>;
  color: string;
}> = ({ progress, color }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(progress.value * 100, 0), 100)}%`,
  }));

  return (
    <Animated.View
      style={[{ height: '100%', backgroundColor: color }, animatedStyle]}
    />
  );
};

export const MultiProgressBar: React.FC<MultiProgressBarProps> = ({
  total,
  activeIndex,
  progress,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  if (total <= 0) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <View key={index} style={styles.track}>
            {isCompleted ? (
              <View style={[styles.fill, { width: '100%' }]} />
            ) : isActive ? (
              <ActiveBarFill progress={progress} color={theme.white} />
            ) : (
              <View style={[styles.fill, { width: '0%' }]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: '100%',
      paddingHorizontal: 8,
      gap: 4,
      position: 'absolute',
      top: 8,
      zIndex: 10,
    },
    track: {
      flex: 1,
      height: 4,
      backgroundColor: theme.overlayWhite40,
      borderRadius: 4,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: theme.white,
    },
  });
