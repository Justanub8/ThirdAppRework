import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { Typography } from '~/constants';
import { BaseText } from '~/components/rn-components';
import { SizedBox } from '~/components/separate-components';
import { TextButton } from '~/components/buttons';
import { PrimaryInput } from '~/components/inputs';
import { NoteIcon, SearchLightIcon } from '~/assets/svgs';
import Note from '~/components/note/Note';
import Chat from '~/components/chat/Chat';
import { conversationApi } from '~/api';
import { useAuthStore } from '~/hooks/useAuthStore';
import { Navigation } from '~/utils';

const MessageScreen = () => {
  const user = useAuthStore(state => state.user);

  const { data: rawConversations, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await conversationApi.getConversations();
      return response.data?.data || [];
    }
  });
  
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const conversations = useMemo(() => {
    const list = rawConversations || [];
    return [...list].sort((a: any, b: any) => {
      const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [rawConversations]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerPlaceholder}></View>
            <BaseText typography={Typography.bodyBold.xxxLarge} numberOfLines={1}>
              {user?.username || 'Message'}
            </BaseText>
            <TouchableOpacity onPress={() => { Navigation.goToNewMessage(); }}>
              <NoteIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
          <SizedBox height={24}/>
          <PrimaryInput 
            LeftComponent={SearchLightIcon}
            placeholder="Tìm kiếm hoặc hỏi Meta AI"
          />
          <SizedBox height={16}/>
          <View>
            <Note/>
          </View>
          <SizedBox height={24}/>
          <View style={styles.sectionHeader}>
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
              const convKey = conv.id || conv._id;
              return (
                <View key={convKey} style={styles.chatItem}>
                  <Chat 
                    conversation={conv}
                    currentUserId={user?.id || user?._id}
                  />
                </View>
              );
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
          <View style={styles.sectionHeader}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  header: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerPlaceholder: {
    width: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatItem: {
    marginBottom: 16,
  },
});

export default MessageScreen;