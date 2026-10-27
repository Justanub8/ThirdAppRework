import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
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
  const [selectedMedia, setSelectedMedia] = useState<SelectedChatMedia | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<
    string | null
  >(null);
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef<any>(null);
  const inputRef = useRef<TextInput>(null);
  const requestIdRef = useRef(0);
  const isFetchingRef = useRef(false);
  const messagesRef = useRef<IMessage[]>(messages);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const scrollToBottom = useCallback((animated: boolean = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated });
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

    const joinRoom = () => {
      socket.emit('join_conversation', id);
    };

    joinRoom();
    socket.on('connect', joinRoom);

    const handleIncomingMessage = (msg: IMessage) => {
      if (!msg) return;
      const msgConvId = msg.conversationId;
      if (!msgConvId || msgConvId === id) {
        setMessages(prev => {
          const msgId = msg.id;
          if (msgId && prev.some(m => m.id === msgId && m.id !== msg.tempId)) {
            return prev;
          }
          const pendingIndex = prev.findIndex(
            m =>
              (msg.tempId &&
                (m.id === msg.tempId || m.tempId === msg.tempId)) ||
              (m.status === 'Sending' &&
                m.senderId === msg.senderId &&
                (m.content || '') === (msg.content || '')),
          );
          if (pendingIndex !== -1) {
            const updated = [...prev];
            updated[pendingIndex] = msg;
            scrollToBottom();
            return updated;
          }
          scrollToBottom();
          return [msg, ...prev];
        });
      }
    };

    const handleUpdatedMessage = (msg: IMessage) => {
      if (!msg || !msg.id) return;
      const msgConvId = msg.conversationId;
      if (!msgConvId || msgConvId === id) {
        setMessages(prev =>
          prev.map(m => (m.id === msg.id ? { ...m, ...msg } : m)),
        );
      }
    };

    const handleUserTyping = (data: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        setIsOtherTyping(data.isTyping);
        if (data.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, 3000);
        }
      }
    };

    socket.on('message', handleIncomingMessage);
    socket.on('message_updated', handleUpdatedMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.emit('leave_conversation', id);
      socket.off('connect', joinRoom);
      socket.off('message', handleIncomingMessage);
      socket.off('message_updated', handleUpdatedMessage);
      socket.off('user_typing', handleUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, id, user?.id, scrollToBottom]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showScrollButton ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showScrollButton, fadeAnim]);

  const fetchData = useCallback(
    async (
      page: number,
      isLoadMore: boolean,
      isRefreshingFlag: boolean = false,
    ) => {
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
          : resultData?.items || resultData?.data || [];

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (isLoadMore) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id).filter(Boolean));
            const uniqueRaw = rawMessages.filter(
              m => !m.id || !existingIds.has(m.id),
            );
            return [...prev, ...uniqueRaw];
          });
        } else {
          setMessages(rawMessages);
        }
        setPageIndex(page);

        const currentTotal =
          (isLoadMore ? messagesRef.current.length : 0) + rawMessages.length;
        const totalRecord = Array.isArray(resultData)
          ? resultData.length
          : resultData?.pagination?.total ||
            resultData?.total_record ||
            resultData?.total ||
            0;

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
    [id],
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
    [],
  );

  const keyExtractor = useCallback(
    (item: IMessage, index: number) => item.id || `msg-${index}`,
    [],
  );

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

  const handleDeleteMessage = useCallback(async (message: IMessage) => {
    if (!message?.id) return;
    const messageId = message.id;
    const originalStatus = message.status;

    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, status: 'Deleted' } : m)),
    );

    try {
      await messageApi.deleteMessage(messageId);
    } catch (error) {
      console.error('Lỗi xoá tin nhắn:', error);
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status: originalStatus } : m)),
      );
    }
  }, []);

  const handlePinMessage = useCallback(async (message: IMessage) => {
    if (!message?.id) return;
    const messageId = message.id;
    const isPinned = message.status === 'Pinned';
    const nextStatus = isPinned ? 'None' : 'Pinned';
    const originalStatus = message.status;

    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, status: nextStatus } : m)),
    );

    try {
      await messageApi.pinMessage({
        messageId,
        status: nextStatus,
      });
      console.log(isPinned ? 'Đã bỏ ghim tin nhắn' : 'Đã ghim tin nhắn');
    } catch (error) {
      console.error('Lỗi ghim/bỏ ghim tin nhắn:', error);
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status: originalStatus } : m)),
      );
    }
  }, []);

  const handleReact = useCallback(
    async (message: IMessage, emoji: string) => {
      if (!message?.id) return;
      const messageId = message.id;
      const existingUserEmoji = message.emojis?.find(
        e => e.senderId === user?.id,
      );

      // Nếu click lại đúng emoji mình đã thả -> gỡ bỏ
      if (existingUserEmoji?.content === emoji) {
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              emojis: (m.emojis || []).filter(e => e.senderId !== user?.id),
            };
          }),
        );
        try {
          await emojiApi.deleteEmoji({ messageId });
        } catch (error) {
          console.error('[handleReact] Lỗi khi gỡ reaction:', error);
        }
        return;
      }

      if (!user?.id) return;

      // Optimistic update emoji
      const optimisticEmoji: IEmoji = {
        messageId,
        content: emoji,
        senderId: user.id,
        sender: {
          id: user.id,
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
      };

      setMessages(prev =>
        prev.map(m => {
          if (m.id !== messageId) return m;
          const currentEmojis = m.emojis || [];
          const filtered = currentEmojis.filter(e => e.senderId !== user?.id);
          return {
            ...m,
            emojis: [...filtered, optimisticEmoji],
          };
        }),
      );

      try {
        const res = await emojiApi.createEmoji({
          messageId,
          content: emoji,
        });

        const createdEmoji: IEmoji =
          (res.data as any)?.data || res.data || optimisticEmoji;

        setMessages(prev =>
          prev.map(m => {
            if (m.id !== messageId) return m;
            const currentEmojis = m.emojis || [];
            const filtered = currentEmojis.filter(e => e.senderId !== user?.id);
            return {
              ...m,
              emojis: [...filtered, createdEmoji],
            };
          }),
        );
      } catch (error: any) {
        console.error('[handleReact] Lỗi cập nhật reaction:', error);
      }
    },
    [user],
  );

  const handleTyping = useCallback(
    (text: string) => {
      setMessageContent(text);
      if (!socket || !id) return;
      socket.emit('typing', { conversationId: id, isTyping: text.length > 0 });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId: id, isTyping: false });
      }, 2000);
    },
    [socket, id],
  );

  const handleSend = async () => {
    if (editingMessage) {
      const content = messageContent.trim();
      if (!content) {
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
            m.id === messageId ? { ...m, content, status: 'Edited' } : m,
          ),
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
        uploadedMediaObj = uploadRes.media || {
          url: uploadRes.url,
          type: selectedMedia.type,
        };
      } catch (error) {
        console.error('Lỗi upload media trong chat:', error);
        setIsUploading(false);
        return;
      }
    }

    const mediaIds = uploadedMediaId ? [uploadedMediaId] : undefined;
    const mediaList = uploadedMediaObj ? [uploadedMediaObj] : undefined;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: IMessage = {
      id: tempId,
      tempId,
      conversationId: id,
      content: content || '',
      senderId: user?.id,
      sender: user
        ? {
            id: user.id,
            username: user.username,
            name: user.name,
            avatarUrl: user.avatarUrl,
          }
        : undefined,
      media: mediaList,
      createdAt: new Date().toISOString(),
      status: 'Sending',
    };

    setMessages(prev => [optimisticMessage, ...prev]);
    inputRef.current?.clear();
    setMessageContent('');
    setInputHeight(32);
    setSelectedMedia(null);
    setIsUploading(false);
    setIsTexting(false);
    scrollToBottom();

    if (socket && socket.connected) {
      socket.emit('message', {
        conversationId: id,
        content: content || '',
        senderId: user?.id,
        mediaId: mediaIds,
        media: mediaList,
        tempId,
      });

      // Đặt timeout nếu sau 10s chưa nhận được message thì coi như thất bại
      setTimeout(() => {
        setMessages(prev =>
          prev.map(m =>
            m.id === tempId && m.status === 'Sending'
              ? { ...m, status: 'Failed' }
              : m,
          ),
        );
      }, 10000);
    } else {
      createMessage.mutate(
        {
          conversationId: id,
          content: content || '',
          mediaId: mediaIds,
          tempId,
        } as any,
        {
          onSuccess: (data: any) => {
            const newMsg: IMessage = data.data || data;
            setMessages(prev => prev.map(m => (m.id === tempId ? newMsg : m)));
            scrollToBottom();
          },
          onError: () => {
            setMessages(prev =>
              prev.map(m =>
                m.id === tempId ? { ...m, status: 'Failed' } : m,
              ),
            );
          },
        },
      );
    }
  };

  const handleRetryMessage = useCallback(
    (failedMessage: IMessage) => {
      if (!failedMessage?.id) return;
      const targetId = failedMessage.id;
      const tempId = failedMessage.tempId || targetId;

      setMessages(prev =>
        prev.map(m => (m.id === targetId ? { ...m, status: 'Sending' } : m)),
      );
      scrollToBottom();

      const mediaIds = failedMessage.media
        ?.map(m => m.id)
        .filter(Boolean) as string[] | undefined;

      if (socket && socket.connected) {
        socket.emit('message', {
          conversationId: id,
          content: failedMessage.content || '',
          senderId: user?.id,
          mediaId: mediaIds,
          media: failedMessage.media,
          tempId,
        });

        setTimeout(() => {
          setMessages(prev =>
            prev.map(m =>
              m.id === targetId && m.status === 'Sending'
                ? { ...m, status: 'Failed' }
                : m,
            ),
          );
        }, 10000);
      } else {
        createMessage.mutate(
          {
            conversationId: id,
            content: failedMessage.content || '',
            mediaId: mediaIds,
            tempId,
          } as any,
          {
            onSuccess: (data: any) => {
              const newMsg: IMessage = data.data || data;
              setMessages(prev =>
                prev.map(m => (m.id === targetId ? newMsg : m)),
              );
              scrollToBottom();
            },
            onError: () => {
              setMessages(prev =>
                prev.map(m =>
                  m.id === targetId ? { ...m, status: 'Failed' } : m,
                ),
              );
            },
          },
        );
      }
    },
    [socket, id, user?.id, createMessage, scrollToBottom],
  );

  return {
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
    isOtherTyping,

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
    handleRetryMessage,
    handleTyping,
    scrollToBottom,
    keyExtractor,
  };
};
