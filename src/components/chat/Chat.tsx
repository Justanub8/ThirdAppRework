import { View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import React from 'react';
import dayjs from 'dayjs';
import { Typography } from '~/constants';
import { BaseText } from '../rn-components';
import { Avatar } from '../avatar';
import { images } from '~/assets/images';
import { CrossIcon } from '~/assets/svgs';
import { Navigation } from '~/utils';
import { IConversation } from '~/interfaces';
import { Theme, useTheme } from '~/hooks';

interface ChatProps {
    conversation: IConversation;
    currentUserId?: string;
}

const Chat = ({ conversation, currentUserId }: ChatProps) => {
  const otherUser = conversation.participants.find((p: any) => p.id !== currentUserId) || conversation.participants[0];
  const displayName = otherUser?.username || otherUser?.name || 'Unknown';
  const avatarUri = otherUser?.avatarUrl || otherUser?.imageUrl;
  const conversationId = conversation.id || '';
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const targetDate = conversation.lastMessage?.createdAt || conversation.createdAt || new Date();
  const isToday = dayjs(targetDate).isSame(dayjs(), 'day');
  const timeDisplay = isToday 
    ? dayjs(targetDate).format('HH:mm') 
    : dayjs(targetDate).format('DD/MM/YYYY');

  return (
    <TouchableOpacity 
        style={styles.chatContainer}
        onPress={() => Navigation.goToConversation(conversationId, displayName, avatarUri)}
    >
        <View style={styles.leftRow}>
            <Avatar 
                url={avatarUri} 
                size={56} 
                disabled 
            />
            <View style={styles.infoColumn}>
                <BaseText typography={Typography.bodyBold.medium}>
                    {displayName}
                </BaseText>
                <View style={styles.messageRow}>
                    <BaseText typography={Typography.bodyRegular.medium} numberOfLines={1} style={styles.messagePreview}>
                    {conversation.lastMessage?.content || 'Đã gửi 1 nội dung'}
                    </BaseText>
                    <BaseText typography={Typography.bodyRegular.medium}>
                        {timeDisplay}
                    </BaseText>
                </View>
            </View>
        </View>
        
        {false ? (
            <View style={styles.actionRow}>
                <View style={styles.followButton}>
                    <Button title='Theo dõi' color={'#FFFFFF'} />
                </View>
                <TouchableOpacity>
                    <CrossIcon height={24} width={24} />
                </TouchableOpacity>
            </View>
        ) : null}
    </TouchableOpacity>
  );
};

const getStyles =(theme: Theme) =>  StyleSheet.create({
  chatContainer: {
    backgroundColor: theme.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoColumn: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    width: '60%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  followButton: {
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#3797EF',
  },
});

export default Chat;