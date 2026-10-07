import { TouchableOpacity, StyleSheet, View, ScrollView } from 'react-native';
import React, { useMemo, useState } from 'react';
import { IEmoji } from '~/interfaces';
import { BaseText } from '~/components/rn-components';
import { Theme, useTheme, useAuthStore } from '~/hooks';
import { BasePopUp } from '~/components/pop-up';
import { Avatar } from '~/components/avatar';
import { emojiApi } from '~/api/emojiApi';

const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

interface ReactBadgeProps {
  emojis: IEmoji[];
  onPress?: () => void;
  onRemoveEmoji?: (emoji: IEmoji) => void;
}

const ReactBadge = ({ emojis, onPress, onRemoveEmoji }: ReactBadgeProps) => {
  const { theme } = useTheme();
  const authUserId = useAuthStore(state => state.user?.id);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);

  const recentEmoji = useMemo(() => {
    if (!emojis || emojis.length === 0) return '';
    const unique = Array.from(
      new Set(emojis.map(e => e.content).filter(Boolean))
    );
    return unique.slice(0, 3).join('');
  }, [emojis]);

  if (!emojis || emojis.length === 0) {
    return null;
  }

  const handlePress = () => {
    setVisible(true);
    onPress?.();
  };

  const handleRemoveEmoji = async (emoji: IEmoji) => {
    setVisible(false);
    if (onRemoveEmoji) {
      onRemoveEmoji(emoji);
    } else {
      try {
        await emojiApi.deleteEmoji({ messageId: emoji.messageId });
      } catch (err) {
        console.error('[ReactBadge] Lỗi khi gỡ reaction:', err);
      }
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
        hitSlop={HIT_SLOP}
      >
        <BaseText style={styles.emojiText}>{recentEmoji}</BaseText>
        {emojis.length > 1 ? (
          <BaseText style={styles.countText}>{emojis.length}</BaseText>
        ) : null}
      </TouchableOpacity>

      <BasePopUp
        visible={visible}
        onClose={() => setVisible(false)}
        height={350}
        width={300}
      >
        <View style={styles.popupContent}>
          <View style={styles.header}>
            <BaseText style={styles.headerTitle}>
              Biểu cảm ({emojis.length})
            </BaseText>
          </View>
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {emojis.map((emoji, index) => {
              const isMyEmoji = Boolean(
                authUserId && (emoji.senderId === authUserId || emoji.sender?.id === authUserId)
              );
              const displayName = isMyEmoji
                ? (emoji.sender?.name || emoji.sender?.username || 'Bạn')
                : (emoji.sender?.name || emoji.sender?.username || 'Người dùng');
              const avatarUrl = emoji.sender?.avatarUrl;

              const rowContent = (
                <View style={styles.emojiItemRow}>
                  <Avatar url={avatarUrl} size={36} disabled />
                  <View style={styles.emojiItemInfo}>
                    <BaseText style={styles.senderName} numberOfLines={1}>
                      {displayName}
                    </BaseText>
                    {isMyEmoji ? (
                      <BaseText style={styles.removeHintText}>
                        Nhấn để gỡ
                      </BaseText>
                    ) : null}
                  </View>
                  <BaseText style={styles.reactionEmoji}>
                    {emoji.content}
                  </BaseText>
                </View>
              );

              if (isMyEmoji) {
                return (
                  <TouchableOpacity
                    key={emoji.id || `${emoji.senderId || index}_${emoji.content}`}
                    activeOpacity={0.65}
                    onPress={() => handleRemoveEmoji(emoji)}
                  >
                    {rowContent}
                  </TouchableOpacity>
                );
              }

              return (
                <View key={emoji.id || `${emoji.senderId || index}_${emoji.content}`}>
                  {rowContent}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </BasePopUp>
    </>
  );
};

const getStyles = (theme: Theme) => {
  const isDark = theme.background === '#000000';

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: -9,
      right: 4,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 11,
      backgroundColor: isDark ? '#262628' : '#F2F2F7',
      borderWidth: 1,
      borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 3,
    },
    emojiText: {
      fontSize: 12,
      lineHeight: 16,
    },
    countText: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 3,
    },
    popupContent: {
      flex: 1,
      width: '100%',
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      paddingVertical: 6,
    },
    emojiItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    emojiItemInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
    },
    senderName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    removeHintText: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.65)',
      marginTop: 2,
    },
    reactionEmoji: {
      fontSize: 22,
      marginLeft: 10,
    },
  });
};

export default React.memo(ReactBadge);