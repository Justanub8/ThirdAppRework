import { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Animated, 
    NativeSyntheticEvent, 
    NativeScrollEvent,
    TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { messageApi, emojiApi } from '~/api';
import { mediaApi } from '~/api/mediaApi';
import { IMessage, IMedia, IEmoji } from '~/interfaces';
import { SelectedChatMedia } from '~/components/sheets/MediaSheet';
import { useAuthStore, useMessageMutation } from '~/hooks';
import { useSocket } from '~/context';

const SHOW_SCROLL_BUTTON_OFFSET = 300;

export interface UseConversationLogicParams {
    id: string;
}

export const useConversationLogic = ({ id }: UseConversationLogicParams) => {
    const { user } = useAuthStore();
    const socket = useSocket();
    const navigation = useNavigation();
    const { createMessage } = useMessageMutation();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFull, setIsFull] = useState<boolean>(false);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [messages, setMessages] = useState<IMessage[]>([]);

    const [isTexting, setIsTexting] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [inputHeight, setInputHeight] = useState(32);
    const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<SelectedChatMedia | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [showScrollButton, setShowScrollButton] = useState(false);
    const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const listRef = useRef<any>(null);
    const inputRef = useRef<TextInput>(null);
    const requestIdRef = useRef(0);
    const isFetchingRef = useRef(false);
    const messagesRef = useRef<IMessage[]>(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const handleTogglePlayVideo = useCallback((videoId: string) => {
        setActivePlayingVideoId(currentPlayingId => {
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

        const handleUpdatedMessage = (msg: IMessage) => {
            if (!msg || !msg.id) return;
            const msgConvId = msg.conversationId;
            if (!msgConvId || msgConvId === id) {
                setMessages(prev =>
                    prev.map(m => (m.id === msg.id ? { ...m, ...msg } : m))
                );
            }
        };

        socket.on('message', handleIncomingMessage);
        socket.on('message_updated', handleUpdatedMessage);

        return () => {
            socket.off('message', handleIncomingMessage);
            socket.off('message_updated', handleUpdatedMessage);
        };
    }, [socket, id]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showScrollButton ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showScrollButton, fadeAnim]);

    const fetchData = useCallback(
        async (page: number, isLoadMore: boolean, isRefreshingFlag: boolean = false) => {
            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;

            try {
                if (isLoadMore) {
                    setIsFetchingNextPage(true);
                } else if (isRefreshingFlag) {
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

    const scrollToBottom = useCallback(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    const keyExtractor = useCallback((item: IMessage) => item.id || Math.random().toString(), []);

    const handleStartEdit = useCallback((message: IMessage) => {
        if (!message || message.status === 'Deleted') return;
        setEditingMessage(message);
        setMessageContent(message.content || '');
        setIsTexting(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingMessage(null);
        setMessageContent('');
        setInputHeight(32);
        setIsTexting(false);
        inputRef.current?.clear();
        inputRef.current?.blur();
    }, []);

    const handleDeleteMessage = useCallback(
        async (message: IMessage) => {
            if (!message?.id) return;
            const messageId = message.id;

            // Cập nhật local state ngay lập tức
            setMessages(prev =>
                prev.map(m =>
                    m.id === messageId ? { ...m, status: 'Deleted' } : m
                )
            );

            try {
                await messageApi.editMessage({
                    messageId,
                    status: 'Deleted',
                });
            } catch (error) {
                console.error('Lỗi xoá tin nhắn:', error);
            }
        },
        []
    );

    const handlePinMessage = useCallback(
        async(message: IMessage) => {
            if (!message?.id) return;
            const messageId = message.id;
            setMessages(prev =>
                prev.map(m =>
                    m.id === messageId ? { ...m, status: 'Pinned' } : m
                )
            );

            try {
                await messageApi.editMessage({
                    messageId,
                    status: 'PINNED',
                });
            } catch (error) {
                console.error('Lỗi ghim tin nhắn:', error);
            }
        }, []
    );

    const handleReact = useCallback(
        async (message: IMessage, emoji: string) => {
            if (!message?.id) return;
            const messageId = message.id;

            try {
                console.log(`[handleReact] Gửi reaction "${emoji}" cho messageId: ${messageId}`);
                const res = await emojiApi.createEmoji({
                    messageId,
                    content: emoji,
                });
                console.log('[handleReact] Lưu vào database thành công:', res.data);

                const createdEmoji: IEmoji = (res.data as any)?.data || res.data || {
                    messageId,
                    content: emoji,
                    senderId: user?.id,
                };

                setMessages(prev =>
                    prev.map(m => {
                        if (m.id !== messageId) return m;
                        const currentEmojis = m.emojis || [];
                        const filtered = currentEmojis.filter(e => e.senderId !== user?.id);
                        return {
                            ...m,
                            emojis: [...filtered, createdEmoji],
                        };
                    })
                );
            } catch (error: any) {
                console.error('[handleReact] Lỗi tạo reaction:', error?.response?.data || error?.message || error);
                // Nếu người dùng đã react tin nhắn này trước đó, thử xoá và tạo lại emoji mới
                if (error?.response?.data?.message === 'Đã react tin nhắn này' || error?.response?.status === 400) {
                    try {
                        console.log('[handleReact] Đã react trước đó, thử xoá và cập nhật lại...');
                        await emojiApi.deleteEmoji({ messageId });
                        const res = await emojiApi.createEmoji({
                            messageId,
                            content: emoji,
                        });
                        console.log('[handleReact] Cập nhật lại reaction mới vào database thành công:', res.data);

                        const createdEmoji: IEmoji = (res.data as any)?.data || res.data || {
                            messageId,
                            content: emoji,
                            senderId: user?.id,
                        };

                        setMessages(prev =>
                            prev.map(m => {
                                if (m.id !== messageId) return m;
                                const currentEmojis = m.emojis || [];
                                const filtered = currentEmojis.filter(e => e.senderId !== user?.id);
                                return {
                                    ...m,
                                    emojis: [...filtered, createdEmoji],
                                };
                            })
                        );
                    } catch (retryErr: any) {
                        console.error('[handleReact] Lỗi khi cập nhật lại reaction:', retryErr?.response?.data || retryErr);
                    }
                }
            }
        },
        [user?.id]
    );

    const handleSend = async () => {
        if (editingMessage) {
            const content = messageContent.trim();
            if (!content) {
                // Nếu content = "" thì không gọi api mà giữ nguyên bỏ focus vào textinput
                handleCancelEdit();
                return;
            }

            const messageId = editingMessage.id;
            if (!messageId) {
                handleCancelEdit();
                return;
            }

            try {
                await messageApi.editMessage({
                    messageId,
                    content,
                    status: 'Edited',
                });
                setMessages(prev =>
                    prev.map(m =>
                        m.id === messageId
                            ? { ...m, content, status: 'Edited' }
                            : m
                    )
                );
            } catch (error) {
                console.error('Lỗi chỉnh sửa tin nhắn:', error);
            } finally {
                handleCancelEdit();
            }
            return;
        }

        const content = messageContent.trim();
        if (!content && !selectedMedia) return;
        if (isUploading) return;
        setActivePlayingVideoId(null);

        let uploadedMediaId: string | undefined;
        let uploadedMediaObj: IMedia | undefined;

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
            inputRef.current?.clear();
            setMessageContent('');
            setInputHeight(32);
            setSelectedMedia(null);
            setIsUploading(false);
            setIsTexting(false);
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
                        inputRef.current?.clear();
                        setMessageContent('');
                        setInputHeight(32);
                        setSelectedMedia(null);
                        setIsUploading(false);
                        setIsTexting(false);
                    },
                    onError: () => {
                        setIsUploading(false);
                    }
                }
            );
        }
    };

    return {
        // State
        messages,
        setMessages,
        isLoading,
        isRefreshing,
        isFetchingNextPage,
        isFull,
        isTexting,
        setIsTexting,
        messageContent,
        setMessageContent,
        inputHeight,
        setInputHeight,
        editingMessage,
        setEditingMessage,
        selectedMedia,
        setSelectedMedia,
        isUploading,
        showScrollButton,
        fadeAnim,
        activePlayingVideoId,
        listRef,
        inputRef,
        user,

        // Handlers & Functions
        fetchData,
        handleRefresh,
        handleLoadMore,
        handleScroll,
        handleTogglePlayVideo,
        handleStartEdit,
        handleCancelEdit,
        handleDeleteMessage,
        handlePinMessage,
        handleReact,
        handleSend,
        scrollToBottom,
        keyExtractor,
    };
};

