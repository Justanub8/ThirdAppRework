import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CustomHeader } from '~/components/headers'
import { CameraLightIcon, LeftArrow, MoreIcon, RightArrow } from '~/assets/svgs'
import { PrimaryInput } from '~/components/inputs'
import { BaseText, BaseTextInput, FastImage } from '~/components/rn-components'
import { Typography } from '~/constants'
import { Navigation } from '~/utils'
import { images } from '~/assets/images'
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '~/api'
import { IProfileUser } from '~/interfaces'
import { PrimaryButton } from '~/components/buttons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConversationMutation, useMessageMutation, useTheme, Theme } from '~/hooks'

const NewMessage = () => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);
    const [isFront, setIsFront] = useState(false);
    const [isTexting, setIsTexting] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentContact, setCurrentContact] = useState<IProfileUser>();
    const [conversationId, setConversationId] = useState("");
    const { createConversation } = useConversationMutation();
    const { createMessage } = useMessageMutation();

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['suggestedUsers'],
        queryFn: async () => {
            const res = await userApi.getAllUsers(1, 20);
            return res.data?.users || res.data?.data || [];
        }
    });

    const handleChooseContact = async (contact: IProfileUser) => {
        const contactId = contact?.id || contact?._id;
        if (!contactId) return;
        try {
            const res = await createConversation.mutateAsync(contactId);
            const convId = res.data?.data?.id || res.data?.data?._id || (res.data as any)?.id || (res.data as any)?._id;
            if (convId) {
                setConversationId(convId);
            }
        } catch (error) {
            console.log("Lỗi khi tìm/tạo cuộc trò chuyện", error);
        }
    };

    const handleSend = async () => {
        if (!messageContent.trim() || !conversationId) return;
        try {
            await createMessage.mutateAsync({ conversationId: conversationId, content: messageContent });
            setMessageContent('');
            Navigation.goToConversation(conversationId);
        } catch (error) {
            console.log("Lỗi khi gửi tin nhắn", error);
        }
    };

    const users = (usersData || []).filter(u => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q))
        );
    });

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <CustomHeader
                title='Tin nhắn mới'
                LeftComponent={<LeftArrow height={24} width={24} onPress={() => Navigation.pop()} />}
            />
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.inputContainer}>
                    <BaseText typography={Typography.bodyMedium.large}>
                        Đến: 
                    </BaseText>
                    <BaseTextInput
                        style={styles.toWhomInput}
                        placeholder='Tìm kiếm'
                        typography={Typography.bodyMedium.large}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <View style={styles.container}>
                    <View style={[styles.card, { zIndex: 2 }]}>
                        <ScrollView contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
                            <View style={{ padding: 16 }}>
                                <BaseText typography={Typography.bodyBold.large}>Gợi ý</BaseText>
                            </View>
                            
                            <View style={{ gap: 12 }}>
                                {users.map((item) => {
                                    const itemAvatar = item.avatarUrl || item.imageUrl;
                                    const itemKey = item.id || item._id;
                                    return (
                                        <TouchableOpacity 
                                            key={itemKey} 
                                            style={styles.contactContainer} 
                                            onPress={() => {
                                                setIsFront(true);
                                                setCurrentContact(item);
                                                handleChooseContact(item);
                                            }}
                                        >
                                            <FastImage 
                                                source={itemAvatar ? { uri: itemAvatar } : images.avater_random} 
                                                style={[styles.avatar, { width: 48, height: 48 }]}
                                            />
                                            <View>
                                                <BaseText typography={Typography.bodySemiBold.medium}>{item.username}</BaseText>
                                                {item.name && (
                                                    <BaseText typography={Typography.bodyRegular.small} color={theme.subtext}>
                                                        {item.name}
                                                    </BaseText>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={[styles.card, { zIndex: isFront ? 3 : 1 }]}>
                        <View style={{ justifyContent: 'space-between', flex: 1 }}>
                            <View style={{ alignItems: 'center', padding: 16, gap: 8 }}> 
                                <FastImage 
                                    source={(currentContact?.avatarUrl || currentContact?.imageUrl) ? { uri: currentContact?.avatarUrl || currentContact?.imageUrl } : images.avater_random} 
                                    style={[styles.avatar, { width: 80, height: 80 }]}
                                />
                                <BaseText typography={Typography.bodyBold.large}>{currentContact?.username}</BaseText>
                                <BaseText>
                                    {currentContact?.follower || 0} người theo dõi - {currentContact?.postCount || 0} bài viết
                                </BaseText>
                                <BaseText> Các bạn theo dõi nhau trên Instagram</BaseText>
                                <TouchableOpacity 
                                    onPress={() => {
                                        const contactProfileId = currentContact?.id || currentContact?._id;
                                        if (contactProfileId) {
                                            Navigation.goToUserProfile(contactProfileId);
                                        }
                                    }}
                                    style={{ borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: theme.buttonDisabled }}
                                >
                                    <BaseText style={{ color: theme.white }}>
                                        Xem trang cá nhân
                                    </BaseText>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.messageInput}>
                                {!isTexting ? (
                                    <TouchableOpacity style={styles.cameraIcon}>
                                        <CameraLightIcon height={24} width={24} />
                                    </TouchableOpacity>
                                ) : null}
                                <BaseTextInput
                                    placeholder='Nhắn tin..'
                                    style={{ flex: 1 }}
                                    value={messageContent}
                                    onFocus={() => { setIsTexting(true); }}
                                    onBlur={() => setIsTexting(false)}
                                    onChangeText={setMessageContent}
                                    onSubmitEditing={() => { handleSend(); }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (theme: Theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    inputContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 16,
    },
    toWhomInput: {
        flex: 1,
        marginLeft: 8,
    },
    avatar: {
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: theme.border,
    },
    contactContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    container: {
        flex: 1,
        position: 'relative',
        borderWidth: 1,
        borderColor: theme.border,
    },
    card: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.background,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 9999,
        height: 40,
        backgroundColor: theme.input,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        paddingHorizontal: 8,
    },
    cameraIcon: {
        backgroundColor: theme.bubbleLavender,
        borderRadius: 9999,
        padding: 4,
    },
});

export default NewMessage;