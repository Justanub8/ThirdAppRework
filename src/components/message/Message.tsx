import { TouchableOpacity, View, StyleSheet } from 'react-native';
import * as React from 'react';
import { IMessage } from '~/interfaces';
import { BaseText } from '../rn-components';
import { useAuthStore } from '~/hooks';
import dayjs from 'dayjs';
import { Typography } from '~/constants';

const TIME_THRESHOLD_MINUTES = 15;

interface MessageProps {
    item: IMessage;
    previous?: IMessage;
    isRefreshing?: boolean;
    currentUserId?: string;
}

const Message = ({ item, previous, isRefreshing, currentUserId }: MessageProps) => {
    const storeUserId = useAuthStore(state => state.user?.id);
    const userId = currentUserId || storeUserId;
    const senderObj = item.sender || (typeof item.senderId === 'object' ? item.senderId : null);
    const messageSenderId = senderObj?.id || (typeof item.senderId === 'string' ? item.senderId : undefined);
    const isMyMessage = !!userId && messageSenderId === userId;
    const senderDisplayName = senderObj?.username || senderObj?.name || 'Unknown';
    const [showTime, setShowTime] = React.useState(false);
    const [showName, setShowName] = React.useState(false);

    const hasLargeTimeDiff = React.useMemo(() => {
        if (!previous) return true;
        const currentMessageTime = dayjs(item.createdAt);
        const previousMessageTime = dayjs(previous.createdAt);
        return Math.abs(currentMessageTime.diff(previousMessageTime, 'minute')) > TIME_THRESHOLD_MINUTES;
    }, [item.createdAt, previous?.createdAt]);

    React.useEffect(() => {
        if (isRefreshing) {
            setShowTime(false);
            setShowName(false);
        }
    }, [isRefreshing]);

  return (
    <View style={styles.messageWrapper}>
        {showTime || hasLargeTimeDiff ? (
            <View style={styles.timeContainer}>
                <BaseText typography={Typography.bodyMedium.small} color="#8E8E8E">
                    {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
                </BaseText>
            </View>
        ) : null}
        {(showName || hasLargeTimeDiff) ? (
            <BaseText 
                typography={Typography.bodyMedium.small} 
                color="#8E8E8E" 
                style={[
                    styles.senderName,
                    isMyMessage ? styles.selfAlignEnd : styles.selfAlignStart
                ]}
            >
                {senderDisplayName}
            </BaseText>
        ) : null}
        <TouchableOpacity 
            style={[
                styles.bubble,
                isMyMessage ? styles.myBubble : styles.otherBubble,
                isMyMessage ? styles.selfAlignEnd : styles.selfAlignStart,
            ]}
            onPress={() => {
                setShowTime(!showTime);
                setShowName(!showName);
            }}
        >
            <BaseText color={isMyMessage ? '#FFFFFF' : '#000000'} typography={Typography.bodyRegular.medium}>
                {item.content}
            </BaseText>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    messageWrapper: {
        width: '100%',
        marginVertical: 2,
    },
    timeContainer: {
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 6,
    },
    senderName: {
        marginHorizontal: 8,
        marginBottom: 2,
    },
    selfAlignEnd: {
        alignSelf: 'flex-end',
    },
    selfAlignStart: {
        alignSelf: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        maxWidth: '75%',
    },
    myBubble: {
        backgroundColor: '#3797EF',
        borderRadius: 18,
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 18,
    },
    otherBubble: {
        backgroundColor: '#EFEFEF',
        borderRadius: 18,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 4,
    },
});

export default React.memo(Message);