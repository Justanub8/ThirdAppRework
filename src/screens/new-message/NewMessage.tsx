import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native'
import React, { useState} from 'react'
import CustomHeader from '~/components/CustomeHeader'
import { LeftArrow, MoreIcon, RightArrow } from '~/assets/svgs'
import { PrimaryInput } from '~/components/inputs'
import { BaseText, BaseTextInput, FastImage } from '~/components/rn-components'
import { commonStyles, Typography } from '~/constants'
import { Navigation } from '~/utils'
import { images } from '~/assets/images'
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '~/api'
import { IProfileUser } from '~/interfaces'
import { PrimaryButton } from '~/components/buttons'
import { SafeAreaView } from 'react-native-safe-area-context'

const NewMessage = () => {
    const [isFront, setIsFront] = useState(false);
    
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['suggestedUsers'],
        queryFn: async () => {
            const res = await userApi.getAllUsers(20);
            return res.data.users;
        }
    });

    const users = usersData || [];
    const [currentContact, setCurrentContact] = useState<IProfileUser>();
  return (
    <>
        <CustomHeader
            title='Tin nhắn mới'
            LeftComponent={<LeftArrow height={24} width={24} onPress={() => Navigation.pop()}/>}
        />
        <View style={styles.inputContainer}>
            <BaseText typography={Typography.bodyMedium.large}>
            Đến: 
            </BaseText>
            <BaseTextInput
                style={styles.toWhomInput}
                placeholder='Tìm kiếm'
                typography={Typography.bodyMedium.large}
            />
        </View>
        <View style={styles.container}>
            <View style={[styles.card, {zIndex: 2}]}>
                <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                    <View style={{padding: 16}}>
                        <BaseText typography={Typography.bodyBold.large}>Gợi ý</BaseText>
                    </View>
                    
                    <View style={{ gap: 12 }}>
                        {users.map((item) => (
                            <TouchableOpacity key={item._id} style={styles.contactContainer} 
                                onPress={() => {
                                    setIsFront(true) 
                                    setCurrentContact(item)
                                }}
                            >
                                <FastImage 
                                    source={item.imageUrl ? { uri: item.imageUrl } : images.avater_random} 
                                    style={[styles.avatar, {width: 48, height: 48}]}
                                />
                                <BaseText typography={Typography.bodySemiBold.medium}>{item.username}</BaseText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
            <View style={[styles.card, {zIndex: isFront ? 3 : 1}]}>
                <SafeAreaView style={{justifyContent: 'space-between', flex: 1}}>
                    <View style={{alignItems: 'center', padding: 16, gap: 8}}> 
                        <FastImage 
                            source={currentContact?.imageUrl ? { uri: currentContact?.imageUrl } : images.avater_random} 
                            style={[styles.avatar, {width: 80, height: 80}]}
                        />
                        <BaseText>{currentContact?.username}</BaseText>
                        <BaseText>
                                {currentContact?.follower} người theo dõi - {currentContact?.postCount} bài viết
                        </BaseText>
                        <BaseText> Các bạn theo dõi nhau trên Instagram</BaseText>
                        <TouchableOpacity 
                            onPress={() => Navigation.goToUserProfile(currentContact?._id as any)}
                            style={{borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#a4a4a4"}}
                        >
                            <BaseText style={{color: "#ffffff"}}>
                                Xem trang cá nhân
                            </BaseText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.messageInput}>
                        <BaseTextInput
                            placeholder='Nhắn tin..'
                        />
                    </View>
                </SafeAreaView>
            </View>
        </View>
        
    </>
  )
}

const styles = StyleSheet.create({
    inputContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 16,
    },
    toWhomInput: {
        flex: 1,
        marginLeft: 8
    },
    avatar: {
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#000000',
    },
    contactContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    container:{
        flex: 1,
        position: 'relative',
        borderWidth: 1,
        borderColor: "#000"
    },
    card: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
    },
    messageInput: {
        borderWidth: 1,
        borderRadius: 9999,
        height: 40,
        backgroundColor: "#eaeaea",
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        paddingHorizontal: 8,
    }
})
export default NewMessage