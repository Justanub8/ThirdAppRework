import {Modal, Pressable, StyleSheet, useWindowDimensions, View, TouchableOpacity,} from 'react-native';
import Animated, {useSharedValue, withTiming, useAnimatedStyle, runOnJS, Easing} from 'react-native-reanimated';
import React, { useState, useMemo, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useTheme, Theme } from '~/hooks';
import { BaseText } from '~/components/rn-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MessagePopupAction = {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  isDestructive?: boolean;
};

type MessagePopupProps = {
  visible: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<any>;
  transformOrigin: 'left' | 'right';
  paddingHorizontal?: number;
  emojis?: string[];
  onSelectEmoji?: (emoji: string) => void;
  onReply?: () => void;
  onCopy?: () => void;
  onPin?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showCopy?: boolean;
  showDelete?: boolean;
  showEdit?: boolean;
  offset?: number;
  topWidth?: number;
  bottomWidth?: number;
  children?: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DEFAULT_EMOJIS = ['❤️', '👍', '🔥', '😂', '😮', '😢'];

const MessagePopUp = ({
  visible,
  onClose,
  anchorRef,
  transformOrigin,
  paddingHorizontal = 16,
  emojis = DEFAULT_EMOJIS,
  onSelectEmoji,
  onReply,
  onCopy,
  onPin,
  onForward,
  onEdit,
  onDelete,
  showEdit = false,
  showCopy = true,
  showDelete = true,
  offset = 8,
  topWidth = 260,
  bottomWidth = 200,
  children,
}: MessagePopupProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isPresentedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [anchorPos, setAnchorPos] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const progress = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const topOrigin = transformOrigin === 'right' ? 'bottom right' : 'bottom left';
  const bottomOrigin = transformOrigin === 'right' ? 'top right' : 'top left';

  const actions = useMemo(() => {
    const list: { label: string; onPress?: () => void; isDestructive?: boolean }[] = [
      {
        label: 'Trả lời',
        onPress: onReply,
      },
    ];

    if (showCopy) {
      list.push({
        label: 'Sao chép',
        onPress: onCopy,
      });
    }

    if (showEdit) {
      list.push({
        label: 'Chỉnh sửa',
        onPress: onEdit,
      });
    }

    list.push(
      {
        label: 'Ghim tin nhắn',
        onPress: onPin,
      },
      {
        label: 'Chuyển tiếp',
        onPress: onForward,
      },
    );

    if (showDelete) {
      list.push({
        label: 'Xóa tin nhắn',
        onPress: onDelete,
        isDestructive: true,
      });
    }

    return list;
  }, [onReply, showCopy, onCopy, onPin, onForward, showDelete, onDelete, showEdit, onEdit]);

  const calculateTargetShift = useCallback(
    (y: number, h: number, actionCount: number) => {
      const reactionHeight = 52;
      const menuEstHeight = actionCount * 44 + 16;
      const safeTop = Math.max(insets.top + 16, 50);
      const safeBottom = Math.max(insets.bottom + 16, 50);

      const topSpaceNeeded = reactionHeight + offset;
      const bottomSpaceNeeded = menuEstHeight + offset;

      const minAllowedY = safeTop + topSpaceNeeded;
      const maxAllowedY = screenHeight - safeBottom - bottomSpaceNeeded - h;

      if (minAllowedY > maxAllowedY) {
        return y < screenHeight / 2 ? minAllowedY - y : maxAllowedY - y;
      }

      if (y < minAllowedY) {
        return minAllowedY - y;
      }
      if (y > maxAllowedY) {
        return maxAllowedY - y;
      }

      // Nếu ở khoảng an toàn, dịch nhẹ về tâm màn hình (focal position) để tạo cảm giác tập trung
      const totalGroupHeight = topSpaceNeeded + h + bottomSpaceNeeded;
      const idealY = (screenHeight - totalGroupHeight) / 2 + topSpaceNeeded;
      const focalY = y + (idealY - y) * 0.35;
      const clampedFocalY = Math.min(Math.max(focalY, minAllowedY), maxAllowedY);
      return clampedFocalY - y;
    },
    [insets.top, insets.bottom, offset, screenHeight],
  );

  const triggerAnimation = useCallback(
    (show: boolean, targetShift = 0) => {
      if (show) {
        progress.value = withTiming(1, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(targetShift, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(1.02, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        progress.value = withTiming(
          0,
          { duration: 180, easing: Easing.in(Easing.cubic) },
        );
        scale.value = withTiming(1, {
          duration: 200,
          easing: Easing.inOut(Easing.cubic),
        });
        translateY.value = withTiming(
          0,
          { duration: 200, easing: Easing.inOut(Easing.cubic) },
          (isFinished) => {
            if (isFinished) {
              runOnJS(setMounted)(false);
              runOnJS(setAnchorPos)(null);
            }
          },
        );
      }
    },
    [progress, scale, translateY],
  );

  useEffect(() => {
    if (visible) {
      if (!isPresentedRef.current && anchorRef?.current) {
        isPresentedRef.current = true;
        anchorRef.current.measureInWindow((x: number, y: number, w: number, h: number) => {
          if (!w && !h) {
            isPresentedRef.current = false;
            return;
          }
          const targetShift = calculateTargetShift(y, h, actions.length);
          translateY.value = 0;
          scale.value = 1;
          progress.value = 0;
          setAnchorPos({ x, y, w, h });
          setMounted(true);
          triggerAnimation(true, targetShift);
        });
      }
    } else {
      if (isPresentedRef.current) {
        isPresentedRef.current = false;
        triggerAnimation(false);
      }
    }
  }, [
    visible,
    anchorRef,
    actions.length,
    calculateTargetShift,
    triggerAnimation,
    translateY,
    scale,
    progress,
  ]);

  const getLeft = (boxWidth: number) => {
    if (transformOrigin === 'right') {
      return screenWidth - boxWidth - paddingHorizontal;
    }
    return paddingHorizontal;
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const groupTranslateAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const topAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + 0.3 * progress.value }],
  }));

  const bottomAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + 0.3 * progress.value }],
  }));

  const handleEmojiPress = (emoji: string) => {
    if (onSelectEmoji) {
      onSelectEmoji(emoji);
    }
    onClose();
  };

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="fade"
      onRequestClose={onClose}
    >
      <AnimatedPressable
        style={[styles.backdrop, backdropStyle]}
        onPress={onClose}
      >
        {anchorPos && (
          <>
            {children && (
              <Animated.View
                style={[
                  styles.anchorContainer,
                  {
                    top: anchorPos.y,
                    left: anchorPos.x,
                    width: anchorPos.w,
                    height: anchorPos.h,
                  },
                  bubbleAnimStyle,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onClose}
                  style={styles.fullSize}
                >
                  {children}
                </TouchableOpacity>
              </Animated.View>
            )}

            <Animated.View
              style={[
                styles.anchorContainer,
                styles.reactionAnchor,
                {
                  top: anchorPos.y - offset,
                  left: getLeft(topWidth),
                  width: topWidth,
                },
                groupTranslateAnimStyle,
              ]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  style={[
                    styles.reactionBar,
                    {
                      backgroundColor: theme.sheet,
                      width: topWidth,
                      transformOrigin: topOrigin,
                    },
                    topAnimStyle,
                  ]}
                >
                  {emojis.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.emojiBtn}
                      activeOpacity={0.7}
                      onPress={() => handleEmojiPress(emoji)}
                    >
                      <BaseText style={styles.emojiText}>{emoji}</BaseText>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              </Pressable>
            </Animated.View>

            <Animated.View
              style={[
                styles.anchorContainer,
                {
                  top: anchorPos.y + anchorPos.h + offset,
                  left: getLeft(bottomWidth),
                  width: bottomWidth,
                },
                groupTranslateAnimStyle,
              ]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  style={[
                    styles.menuBox,
                    {
                      backgroundColor: theme.sheet,
                      width: bottomWidth,
                      transformOrigin: bottomOrigin,
                    },
                    bottomAnimStyle,
                  ]}
                >
                  {actions.map((action, index) => (
                    <React.Fragment key={index}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.6}
                        onPress={() => {
                          action.onPress?.();
                          onClose();
                        }}
                      >
                        <BaseText
                          style={[
                            styles.menuText,
                            action.isDestructive && { color: theme.red },
                          ]}
                        >
                          {action.label}
                        </BaseText>
                      </TouchableOpacity>
                      {index < actions.length - 1 && (
                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: theme.input },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Animated.View>
              </Pressable>
            </Animated.View>
          </>
        )}
      </AnimatedPressable>
    </Modal>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    anchorContainer: {
      position: 'absolute',
    },
    reactionAnchor: {
      height: 0,
      overflow: 'visible',
    },
    reactionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 8,
    },
    emojiBtn: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    emojiText: {
      fontSize: 24,
    },
    menuBox: {
      borderRadius: 14,
      paddingVertical: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
      elevation: 8,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    menuText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginHorizontal: 12,
    },
    fullSize: {
      width: '100%',
      height: '100%',
    },
  });

export { MessagePopUp };
