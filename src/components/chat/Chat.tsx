import { View, Text, StyleSheet, Button, TouchableOpacity} from 'react-native'
import React from 'react'
import dayjs from 'dayjs'
import { commonStyles, Typography } from '~/constants'
import { BaseText, FastImage } from '../rn-components'
import { images } from '~/assets/images'
import { CrossIcon } from '~/assets/svgs'
import { Navigation } from '~/utils'
import { IConversation } from '~/interfaces'
interface ChatProps {
    conversation: IConversation;
    currentUserId?: string;
}
const Chat = ({conversation, currentUserId} : ChatProps) => {
  const otherUser = conversation.participants.find((p: any) => p._id !== currentUserId) || conversation.participants[0];
  const displayName = otherUser?.username || 'Unknown';
  
  const targetDate = conversation.lastMessage?.createdAt || conversation.createdAt || new Date();
  const isToday = dayjs(targetDate).isSame(dayjs(), 'day');
  const timeDisplay = isToday 
    ? dayjs(targetDate).format('HH:mm') 
    : dayjs(targetDate).format('DD/MM/YYYY');

  return (
    <TouchableOpacity 
        style = {[commonStyles.container, commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.justifyBetween]}
        onPress={() => Navigation.goToConversation(conversation._id, displayName)}
    >
        <View style = {[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap12]}>
            <FastImage 
                source={otherUser?.imageUrl ? { uri: otherUser.imageUrl } : images.avater_random} 
                style = {styles.avatar} 
            />
            <View>
                <BaseText typography = {Typography.bodyBold.medium}>
                    {displayName}
                </BaseText>
                <View style = {[commonStyles.flexRow, commonStyles.gap16,commonStyles.justifyBetween]}>
                    <BaseText typography = {Typography.bodyRegular.medium} numberOfLines={1} style ={{width: '50%'}}>
                    {conversation.lastMessage?.content || ''}
                    </BaseText>
                    <BaseText typography = {Typography.bodyRegular.medium}>
                        {timeDisplay}
                    </BaseText>
                </View>
            </View>
        </View>
        
        { false ? (
            <View style= {[commonStyles.flexRow, commonStyles.alignItemsCenter, commonStyles.gap16]}>
                <View style={styles.followButton}>
                    <Button title='Theo dõi' color={'#FFFFFF'} />
                </View>
                <TouchableOpacity>
                    <CrossIcon height={24} width={24}/>
                </TouchableOpacity>
            </View>
            ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  avatar: {
    height: 60,
    width: 60,
    borderWidth: 1,
    borderRadius: 9999,
    borderColor: '#000000',
  },
  followButton: {
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#3797EF',
  }
})


export default Chat