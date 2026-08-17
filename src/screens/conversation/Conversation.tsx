import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import { messageApi } from '~/api'
import { ArrowToLeft, CallIcon } from '~/assets/svgs'
import { BaseText } from '~/components/rn-components'
import CustomHeader from '~/components/CustomeHeader'
import { AuthenticatedStackParamList } from '~/navigation/types'
import { Navigation } from '~/utils'
import { RouteProp, useRoute } from '@react-navigation/native'
import { IMessage } from '~/interfaces'
import Message from '~/components/message/Message'
import { PrimaryInput } from '~/components/inputs'
import { SafeAreaView } from 'react-native-safe-area-context'
import FastImage from '@d11/react-native-fast-image'
import { images } from '~/assets/images'
import { COLORS, commonStyles } from '~/constants'

type RouteProps = RouteProp<AuthenticatedStackParamList, 'Conversation'>;
const SHOW_SCROLL_BUTTON_OFFSET = 300;

const Conversation = () => {
    const route = useRoute<RouteProps>();
    const { id, name } = route.params as any;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
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

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setShowScrollButton(event.nativeEvent.contentOffset.y > SHOW_SCROLL_BUTTON_OFFSET);
    }, []);

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
                const newMessages = Array.isArray(resultData) ? resultData : (resultData?.items || resultData?.data || []);
                console.log("Loaded messages:", newMessages);

                if (requestId !== requestIdRef.current) {
                    return;
                }

                if (isLoadMore) {
                    setMessages(prev => [...prev, ...newMessages]);
                } else {
                    setMessages(newMessages);
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
                }
            }
        },
        [id]
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            setIsFull(false);
            await fetchData(1, false, true);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchData]);

    const handleLoadMore = () => {
        if (!isFetchingRef.current && !isFetchingNextPage && !isFull && messages.length > 0) {
            isFetchingRef.current = true;
            fetchData(pageIndex + 1, true);
        }
    };

    const renderFooter = useCallback(() => {
        if(!isFetchingNextPage) return null;
        return (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(() => {
        if (isLoading) return null;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
                <BaseText>Chưa có tin nhắn nào</BaseText>
            </View>
        );
    }, [isLoading]);

    const keyExtractor = useCallback((item: IMessage) => item._id, []);
    const handleSend = async () => {
        if (!messageContent.trim()) return;
        try {
            const res = await messageApi.sendMessage(id, messageContent);
            if (res.data && res.data.data) {
                setMessages(prev => [res.data.data, ...prev]);
                // Scroll to top when sending a new message
                listRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
            setMessageContent('');
        } catch (error) {
            console.error("Lỗi gửi tin nhắn", error);
        }
    };
    const renderItem = useCallback(
        ({ item, index }: { item: IMessage; index: number }) => {
            return (
                <Message 
                    item={item}
                    previous={messages[index + 1]}
                    isRefreshing={isRefreshing}
                />
            );
        },
        [messages, isRefreshing]
    );

    useEffect(() => {
        setIsFull(false);
        fetchData(1, false);
    }, [fetchData]);

    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={[commonStyles.alignItemsCenter, commonStyles.justifyBetween, commonStyles.flexRow, commonStyles.paddingHorizontal16, commonStyles.testBorder]}>
              <ArrowToLeft height={24} width={24} onPress={() => Navigation.pop()} style={{zIndex: 1}}/>
              <View style={[commonStyles.flexRow, commonStyles.alignItemsCenter]}>
                <FastImage source={images.avater_random} style = {{width: 40, height: 40, borderWidth: 1, borderColor: COLORS.border, borderRadius: 9999}}/>
                <BaseText>{name}</BaseText>
              </View>
              <CallIcon height={24} width={24} style={{zIndex: 1}}/>
            </View>
            
            <View style={{ flex: 1 }}>
                <FlashList
                    ref={listRef}
                    data={messages}
                    extraData={messages}
                    inverted={true}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                />
                <PrimaryInput
                  placeholder='Nhập tin nhắn...'
                  value={messageContent}
                  onChangeText={setMessageContent}
                  onSubmitEditing={handleSend}
                  returnKeyType='send'
                />
                <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]} pointerEvents={showScrollButton ? 'auto' : 'none'}>
                  <TouchableOpacity
                      style={styles.fabButton}
                      onPress={() => {
                          listRef.current?.scrollToOffset({ offset: 0, animated: true });
                      }}
                  >
                      <View style={{ transform: [{ rotate: '-90deg' }] }}>
                          <ArrowToLeft height={24} width={24} />
                      </View>
                  </TouchableOpacity>
                </Animated.View>
            </View>
            {isLoading && !isRefreshing && (
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', top: 50 }]}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            )}
        </SafeAreaView>
    );
};

export default memo(Conversation);

const styles = StyleSheet.create({
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
    }
});