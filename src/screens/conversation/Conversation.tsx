import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, NativeSyntheticEvent, NativeScrollEvent, KeyboardAvoidingView, Platform } from 'react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { messageApi } from '~/api';
import { ArrowToLeft, CallIcon, CameraLightIcon } from '~/assets/svgs';
import { BaseText, BaseTextInput } from '~/components/rn-components';
import { AuthenticatedStackParamList } from '~/navigation/types';
import { Navigation } from '~/utils';
import { RouteProp, useRoute } from '@react-navigation/native';
import { IMessage } from '~/interfaces';
import Message from '~/components/message/Message';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from '@d11/react-native-fast-image';
import { images } from '~/assets/images';
import { COLORS, Typography } from '~/constants';
import { useMessageMutation, useAuthStore } from '~/hooks';

type RouteProps = RouteProp<AuthenticatedStackParamList, 'Conversation'>;
const SHOW_SCROLL_BUTTON_OFFSET = 300;

const Conversation = () => {
    const route = useRoute<RouteProps>();
    const { id = '', name } = route.params || {};
    const { user } = useAuthStore();
    const { createMessage } = useMessageMutation();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
    const [isTexting, setIsTexting] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [isFull, setIsFull] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const listRef = useRef<any>(null);
    const requestIdRef = useRef(0);
    const isFetchingRef = useRef(false);
    const [messageContent, setMessageContent] = useState('');
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
                const rawMessages: IMessage[] = Array.isArray(resultData) ? resultData : (resultData?.items || resultData?.data || []);
                const newMessages = [...rawMessages].reverse();

                if (requestId !== requestIdRef.current) {
                    return;
                }

                if (isLoadMore) {
                    setMessages(prev => [...newMessages, ...prev]);
                } else {
                    setMessages(newMessages);
                    setTimeout(() => {
                        listRef.current?.scrollToEnd({ animated: false });
                    }, 50);
                }
                setPageIndex(page);

                const currentTotal = (isLoadMore ? messagesRef.current.length : 0) + newMessages.length;
                const totalRecord = Array.isArray(resultData) ? resultData.length : (resultData?.pagination?.total || resultData?.total_record || resultData?.total || 0);
                if (newMessages.length < 20 || currentTotal >= totalRecord) {
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
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            if (contentOffset.y <= 100 && !isFetchingNextPage && !isFull && !isLoading) {
                handleLoadMore();
            }

            const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
            if (distanceFromBottom > SHOW_SCROLL_BUTTON_OFFSET) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        },
        [handleLoadMore, isFetchingNextPage, isFull, isLoading]
    );

    const renderItem = useCallback(
        ({ item, index }: { item: IMessage; index: number }) => {
            const previous = index > 0 ? messages[index - 1] : undefined;
            return (
                <Message
                    item={item}
                    previous={previous}
                    isRefreshing={isRefreshing}
                    currentUserId={user?.id || user?._id}
                />
            );
        },
        [messages, isRefreshing, user]
    );

    const keyExtractor = useCallback((item: IMessage) => item.id || item._id || Math.random().toString(), []);

    const renderHeader = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#8E8E8E" />
            </View>
        );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(() => {
        if (isLoading) return null;
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
                <BaseText typography={Typography.bodyMedium.medium} color="#8E8E8E">
                    Chưa có tin nhắn nào. Hãy gửi lời chào!
                </BaseText>
            </View>
        );
    }, [isLoading]);

    const handleSend = () => {
        if (!messageContent.trim()) return;
        createMessage.mutate(
            { conversationId: id, content: messageContent },
            {
                onSuccess: (data: any) => {
                    const newMsg: IMessage = data.data || data;
                    setMessages(prev => [...prev, newMsg]);
                    setMessageContent('');
                    setTimeout(() => {
                        listRef.current?.scrollToEnd({ animated: true });
                    }, 50);
                }
            }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <ArrowToLeft height={24} width={24} onPress={() => Navigation.pop()} style={styles.zIndex1}/>
              <View style={styles.headerUser}>
                <FastImage source={images.avater_random} style={styles.headerAvatar}/>
                <BaseText typography={Typography.bodyBold.medium}>{name}</BaseText>
              </View>
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
                        data={messages}
                        extraData={messages}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={renderEmpty}
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />
                    <View style={styles.inputContainer}> 
                        <View style={styles.messageInput}>
                            {!isTexting ? (
                            <TouchableOpacity style={styles.cameraIcon}>
                                <CameraLightIcon height={24} width={24}/>
                            </TouchableOpacity>
                            ) : null}
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
                    </View>
                    <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]} pointerEvents={showScrollButton ? 'auto' : 'none'}>
                      <TouchableOpacity
                          style={styles.fabButton}
                          onPress={() => {
                              listRef.current?.scrollToEnd({ animated: true });
                          }}
                      >
                          <View style={styles.rotate90}>
                              <ArrowToLeft height={24} width={24} />
                          </View>
                      </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
            {isLoading && !isRefreshing && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            )}
        </SafeAreaView>
    );
};

export default memo(Conversation);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        borderColor: '#000000',
        height: 60,
    },
    headerUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 9999,
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
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    rotate90: {
        transform: [{ rotate: '90deg' }],
    },
    cameraIcon: {
        backgroundColor: "#eee7f1",
        borderRadius: 9999,
        padding: 4,
    },
    messageInput: {
        borderWidth: 1,
        borderRadius: 9999,
        height: 40,
        backgroundColor: "#eaeaea",
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        paddingHorizontal: 8,
    },
    loadingOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        top: 50,
    },
});