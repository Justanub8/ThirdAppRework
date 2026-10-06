import { Modal, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native';
import React, { ReactNode, useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '~/hooks';

type PopupProps = {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  anchorRef?: React.RefObject<any>;
  animationType?: 'timing' | 'spring';
  transformOrigin?: 'left' | 'right';
  tranformOrigin?: 'left' | 'right';
  offset?: number;
  width?: number;
  topWidth?: number;
  bottomWidth?: number;
  align?: 'left' | 'center' | 'right';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BasePopUp = ({ 
  visible, 
  onClose, 
  children,
  topContent,
  bottomContent,
  anchorRef,
  animationType = 'timing',
  transformOrigin,
  tranformOrigin,
  offset = 8,
  width = 220,
  topWidth,
  bottomWidth,
  align = 'center',
}: PopupProps) => {
  const { theme } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const progress = useSharedValue(0);

  const effectiveOrigin = transformOrigin ?? tranformOrigin;
  const hasDualContent = !!(topContent || bottomContent);
  const finalTopWidth = topWidth ?? width;
  const finalBottomWidth = bottomWidth ?? width;

  // Xác định transformOrigin cho từng popup
  // Nếu left: popup trên nở từ 'bottom left', popup dưới nở từ 'top left'
  // Nếu right: popup trên nở từ 'bottom right', popup dưới nở từ 'top right'
  const topOrigin = effectiveOrigin === 'right' 
    ? 'bottom right' 
    : effectiveOrigin === 'left' 
    ? 'bottom left' 
    : 'bottom center';

  const bottomOrigin = effectiveOrigin === 'right' 
    ? 'top right' 
    : effectiveOrigin === 'left' 
    ? 'top left' 
    : 'top center';

  useEffect(() => {
    if (visible) {
      if (anchorRef?.current) {
        requestAnimationFrame(() => {
          anchorRef.current?.measureInWindow?.((x: number, y: number, w: number, h: number) => {
            setAnchorPos({ x, y, w, h });
            setMounted(true);
            triggerAnimation(true);
          });
        });
      } else {
        setAnchorPos(null);
        setMounted(true);
        triggerAnimation(true);
      }
    } else {
      triggerAnimation(false);
    }
  }, [visible, anchorRef, screenWidth, screenHeight]);

  const triggerAnimation = (show: boolean) => {
    if (show) {
      if (animationType === 'spring') {
        progress.value = withSpring(1, { damping: 15, stiffness: 150 });
      } else {
        progress.value = withTiming(1, { 
          duration: 400, 
          easing: Easing.out(Easing.cubic),
        });
      }
    } else {
      progress.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) }, (isFinished) => {
        if (isFinished) {
          runOnJS(setMounted)(false);
          runOnJS(setAnchorPos)(null);
        }
      });
    }
  };

  const getLeft = (boxWidth: number) => {
    if (!anchorPos) return 16;
    let left = anchorPos.x;
    const effectiveAlign = effectiveOrigin ?? align;
    if (effectiveAlign === 'right') {
      left = anchorPos.x + anchorPos.w - boxWidth;
    } else if (effectiveAlign === 'left') {
      left = anchorPos.x;
    } else if (effectiveAlign === 'center') {
      left = anchorPos.x + (anchorPos.w - boxWidth) / 2;
    }
    return Math.max(16, Math.min(left, screenWidth - boxWidth - 16));
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const singleBoxStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.8 + 0.2 * progress.value }],
  }));

  const topAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.8 + 0.2 * progress.value }],
  }));

  const bottomAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.8 + 0.2 * progress.value }],
  }));

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
    >
      <AnimatedPressable
        style={[
          styles.backdrop,
          backdropStyle,
          (!anchorRef || (!hasDualContent && !anchorPos)) && styles.centeredBackdrop,
        ]}
        onPress={onClose}
      >
        {/* Trường hợp 1: Chế độ 2 Popup (1 Trên, 1 Dưới) theo anchorRef */}
        {hasDualContent && anchorPos ? (
          <>
            {/* Popup Trên: Mọc ngược lên trên, transformOrigin là 'bottom left' hoặc 'bottom right' */}
            {topContent && (
              <View
                style={[
                  styles.anchorContainer,
                  {
                    top: Math.max(10, anchorPos.y - offset),
                    left: getLeft(finalTopWidth),
                    width: finalTopWidth,
                    height: 0,
                    overflow: 'visible',
                  },
                ]}
              >
                <Pressable onPress={(e) => e.stopPropagation()}>
                  <Animated.View
                    style={[
                      styles.box,
                      styles.topBox,
                      { 
                        backgroundColor: theme.sheet, 
                        width: finalTopWidth,
                        transformOrigin: topOrigin,
                      },
                      topAnimStyle,
                    ]}
                  >
                    {topContent}
                  </Animated.View>
                </Pressable>
              </View>
            )}

            {/* Popup Dưới: Xuất hiện dưới nút, transformOrigin là 'top left' hoặc 'top right' */}
            {bottomContent && (
              <View
                style={[
                  styles.anchorContainer,
                  {
                    top: anchorPos.y + anchorPos.h + offset,
                    left: getLeft(finalBottomWidth),
                    width: finalBottomWidth,
                  },
                ]}
              >
                <Pressable onPress={(e) => e.stopPropagation()}>
                  <Animated.View
                    style={[
                      styles.box,
                      { 
                        backgroundColor: theme.sheet, 
                        width: finalBottomWidth,
                        transformOrigin: bottomOrigin,
                      },
                      bottomAnimStyle,
                    ]}
                  >
                    {bottomContent}
                  </Animated.View>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          /* Trường hợp 2: Chế độ 1 Popup đơn (có anchorRef hoặc căn giữa) */
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            style={
              anchorPos
                ? [
                    styles.anchorContainer,
                    {
                      top: anchorPos.y + anchorPos.h + offset,
                      left: getLeft(width),
                    },
                  ]
                : undefined
            }
          >
            <Animated.View 
              style={[
                styles.box, 
                { 
                  backgroundColor: theme.sheet, 
                  width,
                  transformOrigin: anchorPos ? bottomOrigin : 'center',
                }, 
                singleBoxStyle
              ]}
            >
              {children}
            </Animated.View>
          </Pressable>
        )}
      </AnimatedPressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centeredBackdrop: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchorContainer: {
    position: 'absolute',
  },
  box: {
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  topBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});

export { BasePopUp };