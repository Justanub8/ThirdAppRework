import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, NativeSyntheticEvent, NativeScrollEvent, KeyboardAvoidingView, Platform } from 'react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { conversationApi, messageApi } from '~/api';
import { ArrowToLeft, CallIcon, CameraLightIcon, CrossIcon, PlayIcon } from '~/assets/svgs';
import { BaseText, BaseTextInput, FastImage } from '~/components/rn-components';
import { Avatar } from '~/components/avatar';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { Navigation } from '~/utils';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { IMessage } from '~/interfaces';
import Message from '~/components/message/Message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '~/assets/images';
import { COLORS, Typography } from '~/constants';
import { useMessageMutation, useAuthStore, useTheme, Theme } from '~/hooks';
import { useSocket } from '~/context';
import { useQuery } from '@tanstack/react-query';
import { SheetManager } from 'react-native-actions-sheet';
import { mediaApi } from '~/api/mediaApi';
import { SelectedChatMedia } from '~/components/sheets/MediaSheet';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'Conversation'>;
const SHOW_SCROLL_BUTTON_OFFSET = 300;

const Conversation = () => {
    const { theme } = useTheme();
    const styles = React.useMemo(() => getStyles(theme), [theme]);
    const route = useRoute<RouteProps>();
    const { id = '', name: initialName, imageUrl: initialImageUrl } = route.params || {};
    const { user } = useAuthStore();
    const socket = useSocket();
    const { createMessage } = useMessageMutation();

    const { data: conversationData } = useQuery({
        queryKey: ['conversation', id],
        queryFn: async () => {
            const res = await conversationApi.getConversationById(id);
            return res.data?.data || (res.data as any);
        },
        enabled: !!id,
    });

    const currentUserId = user?.id;
    const otherUser = conversationData?.participants?.find(
        (p: any) => p.id !== currentUserId
    ) || conversationData?.participants?.[0];

    const displayName = initialName || otherUser?.username || otherUser?.name || 'Unknown';
    const displayAvatar = initialImageUrl || otherUser?.avatarUrl || otherUser?.imageUrl;
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
    const [isTexting, setIsTexting] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [isFull, setIsFull] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const listRef = useRef<any>(null);
    const requestIdRef = useRef(0);
    const isFetchingRef = useRef(false);
    const [messageContent, setMessageContent] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<SelectedChatMedia | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleTogglePlayVideo = useCallback((videoId: string) => {
        setActivePlayingVideoId(currentPlayingId => {
            // Đảm bảo chỉ 1 video duy nhất chạy tại 1 thời điểm:
            // Nếu bấm vào video đang phát -> dừng lại (null)
            // Nếu bấm vào video khác -> chuyển sang phát duy nhất video đó
            if (currentPlayingId === videoId) {
                return null;
            }
            return videoId;
        });
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setActivePlayingVideoId(null);
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (!socket || !id) return;

        socket.emit('join_conversation', id);

        const handleIncomingMessage = (msg: IMessage) => {
            if (!msg) return;
            const msgConvId = msg.conversationId;
            if (!msgConvId || msgConvId === id) {
                setMessages(prev => {
                    const msgId = msg.id;
                    if (msgId && prev.some(m => m.id === msgId)) {
                        return prev;
                    }
                    return [msg, ...prev];
                });

            }
        };

        socket.on('message', handleIncomingMessage);

        return () => {
            socket.off('message', handleIncomingMessage);
        };
    }, [socket, id]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showScrollButton ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showScrollButton, fadeAnim]);

    const messagesRef = useRef<IMessage[]>(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const fetchData = useCallback(
        async (page: number, isLoadMore: boolean, isRefreshing: boolean = false) => {
            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;

            try {
                if (isLoadMore) {
                    setIsFetchingNextPage(true);
                } else if (isRefreshing) {
                    setIsLoading(false);
                } else {
                    setIsLoading(true);
                }

                const res = await messageApi.getMessages(id, page, 20);
                const resultData = res.data as any;
                const rawMessages: IMessage[] = Array.isArray(resultData)
                    ? resultData
                    : (resultData?.items || resultData?.data || []);

                if (requestId !== requestIdRef.current) {
                    return;
                }

                if (isLoadMore) {
                    setMessages(prev => [...prev, ...rawMessages]);
                } else {
                    setMessages(rawMessages);
                }
                setPageIndex(page);

                const currentTotal = (isLoadMore ? messagesRef.current.length : 0) + rawMessages.length;
                const totalRecord = Array.isArray(resultData)
                    ? resultData.length
                    : (resultData?.pagination?.total || resultData?.total_record || resultData?.total || 0);

                if (rawMessages.length < 20 || currentTotal >= totalRecord) {
                    setIsFull(true);
                } else {
                    setIsFull(false);
                }
            } catch (error) {
                console.error(error);
            } finally {
                isFetchingRef.current = false;
                if (requestId === requestIdRef.current) {
                    setIsLoading(false);
                    setIsFetchingNextPage(false);
                    setIsRefreshing(false);
                }
            }
        },
        [id]
    );

    useEffect(() => {
        fetchData(1, false);
    }, [fetchData]);

    const handleRefresh = useCallback(() => {
        if (isFetchingRef.current) return;
        setActivePlayingVideoId(null);
        setIsRefreshing(true);
        fetchData(1, false, true);
    }, [fetchData]);

    const handleLoadMore = useCallback(() => {
        if (isFetchingRef.current || isFull || isFetchingNextPage || isLoading) {
            return;
        }
        isFetchingRef.current = true;
        fetchData(pageIndex + 1, true);
    }, [isFull, isFetchingNextPage, isLoading, pageIndex, fetchData]);

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { contentOffset } = event.nativeEvent;
            if (contentOffset.y > SHOW_SCROLL_BUTTON_OFFSET) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        },
        []
    );

    const renderItem = useCallback(
        ({ item, index }: { item: IMessage; index: number }) => {
            const previous = index < messages.length - 1 ? messages[index + 1] : undefined;
            return (
                <Message
                    item={item}
                    previous={previous}
                    isRefreshing={isRefreshing}
                    currentUserId={user?.id}
                    activePlayingVideoId={activePlayingVideoId}
                    onTogglePlayVideo={handleTogglePlayVideo}
                />
            );
        },
        [messages, isRefreshing, user, activePlayingVideoId, handleTogglePlayVideo]
    );

    const keyExtractor = useCallback((item: IMessage) => item.id || Math.random().toString(), []);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.subtext} />
            </View>
        );
    }, [isFetchingNextPage, theme.subtext]);

    

    const handleSend = async () => {
        const content = messageContent.trim();
        if (!content && !selectedMedia) return;
        if (isUploading) return;
        setActivePlayingVideoId(null);

        let uploadedMediaId: string | undefined = undefined;
        let uploadedMediaObj: any = undefined;

        if (selectedMedia) {
            try {
                setIsUploading(true);
                const uploadRes = await mediaApi.uploadImage(
                    selectedMedia.uri,
                    undefined,
                    undefined,
                    selectedMedia.type === 'video',
                    selectedMedia.filename || undefined,
                );
                uploadedMediaId = uploadRes.media?.id;
                uploadedMediaObj = uploadRes.media || { url: uploadRes.url, type: selectedMedia.type };
            } catch (error) {
                console.error('Lỗi upload media trong chat:', error);
                setIsUploading(false);
                return;
            }
        }

        const mediaIds = uploadedMediaId ? [uploadedMediaId] : undefined;
        const mediaList = uploadedMediaObj ? [uploadedMediaObj] : undefined;

        if (socket && socket.connected) {
            socket.emit('message', {
                conversationId: id,
                content: content || '',
                senderId: user?.id,
                mediaId: mediaIds,
                media: mediaList,
            });
            console.log("tin nhắn đã được gửi đi qua socket", {
                conversationId: id,
                content: content,
                senderId: user?.id,
                mediaId: mediaIds,
            });
            setMessageContent('');
            setSelectedMedia(null);
            setIsUploading(false);
        } else {
            createMessage.mutate(
                { conversationId: id, content: content || '', mediaId: mediaIds },
                {
                    onSuccess: (data: any) => {
                        const newMsg: IMessage = data.data || data;
                        setMessages(prev => {
                            const msgId = newMsg.id;
                            if (msgId && prev.some(m => m.id === msgId)) {
                                return prev;
                            }
                            return [newMsg, ...prev];
                        });
                        setMessageContent('');
                        setSelectedMedia(null);
                        setIsUploading(false);
                    },
                    onError: () => {
                        setIsUploading(false);
                    }
                }
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <ArrowToLeft height={24} width={24} onPress={() => Navigation.pop()} style={styles.zIndex1}/>
              <TouchableOpacity 
                style={styles.headerUser}
                onPress={() => {
                  const targetUserId = otherUser?.id;
                  if (targetUserId) {
                    Navigation.goToUserProfile(targetUserId);
                  }
                }}
                disabled={!otherUser?.id}

                activeOpacity={0.8}
              >
                <Avatar 
                  url={displayAvatar} 
                  size={36} 
                  disabled 
                />
                <BaseText typography={Typography.bodyBold.medium}>{displayName}</BaseText>
              </TouchableOpacity>
              <CallIcon height={24} width={24} style={styles.zIndex1}/>
            </View>
            
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.flex1}>
                    <FlashList
                        ref={listRef}
                        inverted={true}
                        data={messages}
                        extraData={activePlayingVideoId}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={renderFooter}
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />
                    <View style={styles.inputContainer}> 
                        {selectedMedia ? (
                            <View style={styles.mediaPreviewContainer}>
                                <View style={styles.mediaPreviewWrapper}>
                                    <FastImage source={{ uri: selectedMedia.uri }} style={styles.mediaPreviewThumb} resizeMode="cover" />
                                    {selectedMedia.type === 'video' ? (
                                        <View style={styles.videoBadgeSmall}>
                                            <PlayIcon width={10} height={10} color="#FFFFFF" />
                                        </View>
                                    ) : null}
                                    <TouchableOpacity 
                                        style={styles.removeMediaButton} 
                                        onPress={() => setSelectedMedia(null)}
                                        disabled={isUploading}
                                    >
                                        <CrossIcon width={12} height={12} color="#FFFFFF" />
                                    </TouchableOpacity>
                                    {isUploading ? (
                                        <View style={styles.uploadingOverlay}>
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        ) : null}
                        <View style={styles.messageInput}>
                            {!isTexting ? (
                            <TouchableOpacity 
                                style={styles.cameraIcon}
                                onPress={() => {
                                    setActivePlayingVideoId(null);
                                    SheetManager.show('MediaSheet', {
                                        payload: {
                                            onSelectMedia: (media: SelectedChatMedia) => setSelectedMedia(media),
                                        },
                                    });
                                }}
                                disabled={isUploading}
                            >
                                <CameraLightIcon height={24} width={24}/>
                            </TouchableOpacity>
                            ) : null}
                            <View style={styles.textInputWrapper}>
                                <BaseTextInput
                                    placeholder='Nhập tin nhắn...'
                                    value={messageContent}
                                    onChangeText={setMessageContent}
                                    onFocus={() => setIsTexting(true)}
                                    onBlur={() => setIsTexting(false)}
                                    onSubmitEditing={handleSend}
                                    returnKeyType='send'
                                />
                            </View>
                            {(messageContent.trim().length > 0 || selectedMedia) ? (
                                <TouchableOpacity 
                                    onPress={handleSend} 
                                    disabled={isUploading}
                                    style={styles.sendButton}
                                >
                                    {isUploading ? (
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
                    <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]} pointerEvents={showScrollButton ? 'auto' : 'none'}>
                      <TouchableOpacity
                          style={styles.fabButton}
                          onPress={() => {
                              listRef.current?.scrollToOffset({ offset: 0, animated: true });
                          }}
                      >
                        <ArrowToLeft height={24} width={24} />
                      </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
            {isLoading && !isRefreshing && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                    <ActivityIndicator size="large" color={theme.black} />
                </View>
            )}
        </SafeAreaView>
    );
};

export default memo(Conversation);

const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    flex1: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.border,
        height: 60,
    },
    headerUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    zIndex1: {
        zIndex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    inputContainer: {
        paddingBottom: 8,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 40,
        right: 16,
        zIndex: 10,
    },
    fabButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    cameraIcon: {
        backgroundColor: theme.bubbleLavender,
        borderRadius: 9999,
        padding: 4,
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
    textInputWrapper: {
        flex: 1,
    },
    sendButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaPreviewContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexDirection: 'row',
    },
    mediaPreviewWrapper: {
        width: 64,
        height: 64,
        borderRadius: 10,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.border,
    },
    mediaPreviewThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    videoBadgeSmall: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 4,
        padding: 2,
    },
    removeMediaButton: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        top: 50,
    },
});