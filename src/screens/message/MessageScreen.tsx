import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useEffect, useState } from 'react'
import { commonStyles, Typography } from '~/constants'
import { BaseText } from '~/components/rn-components'
import { SizedBox } from '~/components/separate-components'
import { TextButton } from '~/components/buttons'
import { PrimaryInput } from '~/components/inputs'
import { NoteIcon, SearchLightIcon } from '~/assets/svgs'
import Note from '~/components/note/Note'
import Chat from '~/components/chat/Chat'
import { conversationApi } from '~/api'
import { useAuthStore } from '~/hooks/useAuthStore'
import { Navigation } from '~/utils'

const MessageScreen = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await conversationApi.getConversations();
        if (response.data && response.data.data) {
          setConversations(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      }
    };
    fetchConversations();
  }, []);

  return (
    <SafeAreaView style = {commonStyles.container}>
      <ScrollView style = {commonStyles.paddingScrollHorizontal}>
          <View style={[commonStyles.alignItemsCenter, commonStyles.testBorder, commonStyles.flexRow, commonStyles.justifyBetween]}>
            <View style = {{width: 24}}></View>
            <BaseText typography={Typography.bodyBold.xxxLarge} numberOfLines={1}>
            {user?.username || 'Message'}
            </BaseText>
            <TouchableOpacity>
              <NoteIcon width={24} height={24} onPress={() => {Navigation.goToNewMessage()}}/>
            </TouchableOpacity>
            
          </View>
          <SizedBox height={24}/>
          <PrimaryInput 
            LeftComponent={SearchLightIcon}
            placeholder= "Tìm kiếm hoặc hỏi Meta AI"
          />
          <SizedBox height={16}/>
          <View>
            <Note/>
          </View>
          <SizedBox height={24}/>
          <View style = {[commonStyles.flexRow, commonStyles.justifyBetween]}>
            <BaseText typography={Typography.bodyBold.large}>
              Tin nhắn
            </BaseText>
            <BaseText typography={Typography.bodyRegular.medium} color={'#616161'}>
              Tin nhắn đang chờ 
            </BaseText>
          </View>
          <SizedBox height={24}/>
          <View>
            {conversations.map((conv: any) => {
              const otherUser = conv.participants.find((p: any) => p._id !== user?._id);
              return (
                <View key={conv._id} style={{ marginBottom: 16 }}>
                  <Chat 
                    conversation={conv}
                    currentUserId={user?._id}
                  />
                </View>
              )
            })}
          </View>
          <SizedBox height={24}/>
          <View>
            <BaseText typography={Typography.bodyBold.large}>
              Gợi ý
            </BaseText>
          </View>
          <SizedBox height={24}/>
          {null}
          <SizedBox height={24}/>
          <View style = {[commonStyles.flexRow, commonStyles.justifyBetween]}>
            <BaseText typography={Typography.bodyBold.large}>
              Tài khoản nên theo dõi 
            </BaseText>
            <TextButton title='Xem tất cả' color={'#3797EF'} typography={Typography.bodyRegular.medium}/>
          </View>
          <SizedBox height={24}/>
          {null}
          <SizedBox height={24}/>
      </ScrollView>
    </SafeAreaView>
  )
}


export default MessageScreen