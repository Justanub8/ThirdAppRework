import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { CustomHeader } from '~/components/headers';
import { CameraLightIcon, LeftArrow } from '~/assets/svgs';
import { BaseText, BaseTextInput } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { Typography } from '~/constants';
import { Navigation } from '~/utils';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '~/api';
import { IProfileUser } from '~/interfaces';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversationMutation, useMessageMutation, useTheme, Theme } from '~/hooks';
import { SizedBox } from '~/components/separate-components';

const NewMessage = () => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);
    const [isFront, setIsFront] = useState(false);
    const [isTexting, setIsTexting] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentContact, setCurrentContact] = useState<IProfileUser>();
    const [conversationId, setConversationId] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { createConversation } = useConversationMutation();
    const { createMessage } = useMessageMutation();

    const { data: usersData } = useQuery({
        queryKey: ['suggestedUsers'],
        queryFn: async () => {
            const res = await userApi.getAllUsers(1, 20);
            return res.data?.users || res.data?.data || [];
        }
    });

    const handleSend = async () => {
        const content = messageContent.trim();
        const contactId = currentContact?.id;
        if (!content || !contactId || isSending) return;

        setIsSending(true);
        try {
            let activeConvId = conversationId;
            if (!activeConvId) {
                const res = await createConversation.mutateAsync(contactId);
                activeConvId = res.data?.data?.id || '';
                if (!activeConvId) {
                    console.log('Lỗi: Không thể tìm/tạo cuộc trò chuyện');
                    setIsSending(false);
                    return;
                }
                setConversationId(activeConvId);
            }

            // Gửi tin nhắn vào cuộc trò chuyện vừa tạo
            await createMessage.mutateAsync({ conversationId: activeConvId, content });
            setMessageContent('');
            const contactName = currentContact?.username || currentContact?.name;
            const contactAvatar = currentContact?.avatarUrl || currentContact?.imageUrl;
            Navigation.goToConversation(activeConvId, contactName, contactAvatar);
        } catch (error) {
            console.log('Lỗi khi gửi tin nhắn', error);
        } finally {
            setIsSending(false);
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
                LeftComponent={
                    <LeftArrow 
                        height={24} 
                        width={24} 
                        onPress={() => {
                            if (isFront) {
                                setIsFront(false);
                                setCurrentContact(undefined);
                                setMessageContent('');
                                setConversationId('');
                            } else {
                                Navigation.pop();
                            }
                        }} 
                    />
                }
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
                                <BaseText 
                                    typography={Typography.bodyBold.large}
                                    onPress={() => {Navigation.goToNewGroupMessage()}}
                                >
                                    Nhóm Chat
                                </BaseText>
                                <SizedBox height={24}/>
                                <BaseText typography={Typography.bodyBold.large}>Gợi ý</BaseText>
                            </View>
                            
                            <View style={{ gap: 12 }}>
                                {users.map((item) => {
                                    const itemAvatar = item.avatarUrl || item.imageUrl;
                                    const itemKey = item.id;
                                    return (
                                        <TouchableOpacity 
                                            key={itemKey} 
                                            style={styles.contactContainer} 
                                            onPress={() => {
                                                setIsFront(true);
                                                setCurrentContact(item);
                                                setConversationId('');
                                            }}
                                        >
                                            <Avatar 
                                                url={itemAvatar} 
                                                size={48} 
                                                disabled 
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
                                <Avatar 
                                    url={currentContact?.avatarUrl || currentContact?.imageUrl} 
                                    size={80} 
                                    id={currentContact?.id} 
                                    disabled
                                />
                                <BaseText typography={Typography.bodyBold.large}>{currentContact?.username}</BaseText>
                                <BaseText>
                                    {currentContact?.follower || 0} người theo dõi - {currentContact?.postCount || 0} bài viết
                                </BaseText>
                                <BaseText> Các bạn theo dõi nhau trên Instagram</BaseText>
                                <TouchableOpacity 
                                    onPress={() => {
                                        const contactProfileId = currentContact?.id;
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
                                {!isTexting && messageContent.trim().length === 0 ? (
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
                                    onSubmitEditing={handleSend}
                                    returnKeyType='send'
                                />
                                {messageContent.trim().length > 0 ? (
                                    <TouchableOpacity 
                                        onPress={handleSend} 
                                        disabled={isSending}
                                        style={styles.sendButton}
                                    >
                                        {isSending ? (
                                            <ActivityIndicator size="small" color="#3797EF" />
                                        ) : (
                                            <BaseText typography={Typography.bodyBold.medium} color="#3797EF">
                                                Gửi
                                            </BaseText>
                                        )}
                                    </TouchableOpacity>
                                ) : null}
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
    sendButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        backgroundColor: theme.bubbleLavender,
        borderRadius: 9999,
        padding: 4,
    },
});

export default NewMessage;