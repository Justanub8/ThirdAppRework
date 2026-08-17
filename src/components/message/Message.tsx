import { TouchableOpacity, View } from 'react-native'
import * as React from 'react'
import { IMessage } from '~/interfaces'
import { BaseText } from '../rn-components'
import { useAuthStore } from '~/hooks'
import dayjs from 'dayjs'
import { commonStyles, Typography } from '~/constants'
const TIME_THRESHOLD_MINUTES = 15;
interface MessageProps {
    item: IMessage;
    previous?: IMessage;
    isRefreshing?: boolean;
}

const Message = ({ item, previous, isRefreshing }: MessageProps) => {
    const { user } = useAuthStore();
    const messageSenderId = item.senderId?._id || item.senderId;
    const isMyMessage = messageSenderId === user?._id;
    const [showTime, setShowTime] = React.useState(false);
    const [showName, setShowName] = React.useState(false);

    const timeDiff = () => {
        if (!previous) return true;
        const currentMessageTime = dayjs(item.createdAt);
        const previousMessageTime = dayjs(previous.createdAt);
        return Math.abs(currentMessageTime.diff(previousMessageTime, 'minute')) > TIME_THRESHOLD_MINUTES;
    }

    React.useEffect(() => {
        if (isRefreshing) {
            setShowTime(false);
            setShowName(false);
        }
    }, [isRefreshing]);

  return (
    <View style={commonStyles.container}>
        {showTime || timeDiff() ? (
            <View style={{
                justifyContent: 'center',
                alignSelf: 'center'
            }}>
                <BaseText typography={Typography.bodyMedium.small}>
                    {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
                </BaseText>
            </View>
        ) : null}
        {(showName || timeDiff()) ? (
            <BaseText typography={Typography.bodyMedium.small} style={{alignSelf: isMyMessage ? 'flex-end' : 'flex-start'}}>
                {item.senderId.username || 'Unknown'}
            </BaseText>
        ) : null}
        <TouchableOpacity 
            style={{ 
                    paddingHorizontal: 16,
                    paddingVertical: 10, 
                    backgroundColor: isMyMessage ? '#1866af' : '#f2dddd', 
                    borderRadius: 18, 
                    borderBottomRightRadius: isMyMessage ? 4 : 18,
                    borderBottomLeftRadius: isMyMessage ? 18 : 4,
                    marginVertical: 4, 
                    alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                }}
            onPress={() => {
                setShowTime(!showTime);
                setShowName(!showName);
                }}
        >
            <BaseText color={isMyMessage ? '#000' : '#000'}>
                {item.content}
            </BaseText>
        </TouchableOpacity>
    </View>
    
  )
}

export default React.memo(Message);