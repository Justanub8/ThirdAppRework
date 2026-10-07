import { Modal, Pressable, StyleSheet, DimensionValue } from 'react-native';
import React, { ReactNode, useMemo, useEffect, useState } from 'react';
import { Theme, useTheme } from '~/hooks';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

export type BasePopUpProps = {
  visible: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<any>;
  height?: DimensionValue;
  width?: DimensionValue;
  children?: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BasePopUp = ({
  visible,
  onClose,
  anchorRef: _anchorRef,
  height = 200,
  width = 200,
  children,
}: BasePopUpProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: 160,
          easing: Easing.in(Easing.cubic),
        },
        isFinished => {
          if (isFinished) {
            runOnJS(setMounted)(false);
          }
        }
      );
    }
  }, [visible, progress]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: 0.88 + 0.12 * progress.value,
      },
    ],
  }));

  if (!mounted) {
    return null;
  }

  const customCardSizeStyle = {
    width,
    height,
  };

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
    >
      <AnimatedPressable
        style={[styles.backdrop, backdropAnimatedStyle]}
        onPress={onClose}
      >
        <Animated.View
          style={[styles.popupBox, customCardSizeStyle, cardAnimatedStyle]}
        >
          <Pressable
            style={styles.innerContainer}
            onPress={e => e.stopPropagation()}
          >
            {children}
          </Pressable>
        </Animated.View>
      </AnimatedPressable>
    </Modal>
  );
};

const getStyles = (theme: Theme) => {
  const isDark = theme.background === '#000000';

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? theme.overlayDark : theme.overlayMedium,
      justifyContent: 'center',
      alignItems: 'center',
    },
    popupBox: {
      backgroundColor: isDark ? '#262628' : '#F2F2F7',
      borderRadius: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 10,
    },
    innerContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
      borderRadius: 16,
      overflow: 'hidden',
    },
  });
};

export { BasePopUp };
export default BasePopUp;