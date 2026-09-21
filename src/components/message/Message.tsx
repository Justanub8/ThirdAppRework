import { TouchableOpacity, View, StyleSheet } from 'react-native';
import * as React from 'react';
import { IMessage } from '~/interfaces';
import { BaseText } from '../rn-components';
import { useAuthStore } from '~/hooks';
import dayjs from 'dayjs';
import { Typography } from '~/constants';
import { MessageVideoItem, MessageImageItem } from './components';

const TIME_THRESHOLD_MINUTES = 15;

interface MessageProps {
    item: IMessage;
    previous?: IMessage;
    isRefreshing?: boolean;
    currentUserId?: string;
    activePlayingVideoId?: string | null;
    onTogglePlayVideo?: (videoId: string) => void;
}

const Message = ({
    item,
    previous,
    isRefreshing,
    currentUserId,
    activePlayingVideoId,
    onTogglePlayVideo,
}: MessageProps) => {
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

    const hasMedia = Boolean(item.media && item.media.length > 0);
    const hasContent = Boolean(item.content && item.content.trim().length > 0);

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
                hasMedia && !hasContent ? styles.bubbleWithOnlyMedia : (isMyMessage ? styles.myBubble : styles.otherBubble),
                isMyMessage ? styles.selfAlignEnd : styles.selfAlignStart,
            ]}
            onPress={() => {
                setShowTime(!showTime);
                setShowName(!showName);
            }}
            activeOpacity={0.85}
        >
            {hasMedia ? (
                <View style={styles.mediaContainer}>
                    {item.media!.map((m, idx) => {
                        const isVideo =
                            m.type === 'video' ||
                            /\.(mp4|mov|avi|mkv|webm|3gp|m4v)(\?.*)?$/i.test(m.url || '');
                        const videoId = m.id || `${item.id || 'msg'}_${m.url || idx}`;
                        const isPlaying = activePlayingVideoId === videoId;
                        return (
                            <View key={m.id || idx} style={styles.mediaItemWrapper}>
                                {isVideo ? (
                                    <MessageVideoItem
                                        url={m.url}
                                        videoId={videoId}
                                        isPaused={!isPlaying}
                                        onTogglePlay={onTogglePlayVideo}
                                    />
                                ) : (
                                    <MessageImageItem url={m.url} />
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : null}
            {hasContent ? (
                <BaseText 
                    color={isMyMessage ? '#FFFFFF' : '#000000'} 
                    typography={Typography.bodyRegular.medium}
                    style={hasMedia ? styles.textContentInMedia : undefined}
                >
                    {item.content}
                </BaseText>
            ) : null}
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
    bubbleWithOnlyMedia: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        backgroundColor: 'transparent',
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
    mediaContainer: {
        borderRadius: 14,
        overflow: 'hidden',
        gap: 4,
    },
    mediaItemWrapper: {
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
    },
    textContentInMedia: {
        marginTop: 6,
        paddingHorizontal: 4,
    },
});

export default React.memo(Message, (prevProps, nextProps) => {
    if (prevProps.item !== nextProps.item) return false;
    if (prevProps.previous !== nextProps.previous) return false;
    if (prevProps.isRefreshing !== nextProps.isRefreshing) return false;
    if (prevProps.currentUserId !== nextProps.currentUserId) return false;
    if (prevProps.onTogglePlayVideo !== nextProps.onTogglePlayVideo) return false;

    if (prevProps.activePlayingVideoId !== nextProps.activePlayingVideoId) {
        const checkHasVideo = (msg: IMessage, targetId?: string | null) => {
            if (!targetId || !msg.media || msg.media.length === 0) return false;
            return msg.media.some((m, idx) => {
                const vid = m.id || `${msg.id || 'msg'}_${m.url || idx}`;
                return vid === targetId;
            });
        };

        const wasPlayingInThisMsg = checkHasVideo(prevProps.item, prevProps.activePlayingVideoId);
        const isNowPlayingInThisMsg = checkHasVideo(nextProps.item, nextProps.activePlayingVideoId);

        if (wasPlayingInThisMsg || isNowPlayingInThisMsg) {
            return false;
        }
        return true;
    }

    return true;
});