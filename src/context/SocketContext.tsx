import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '~/hooks';
import Config from 'react-native-config';

export interface UserPresenceInfo {
  isOnline: boolean;
  lastActive?: string | Date | null;
}

export interface PresenceContextType {
  onlineUsers: Record<string, UserPresenceInfo>;
  isUserOnline: (userId?: string) => boolean;
  getUserLastActive: (userId?: string) => string | Date | null | undefined;
}

const SocketContext = createContext<Socket | null>(null);
const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: {},
  isUserOnline: () => false,
  getUserLastActive: () => null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<
    Record<string, UserPresenceInfo>
  >({});
  const socketRef = useRef<Socket | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      clearHeartbeat();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const defaultFallback =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:5050'
        : 'http://localhost:5050';

    const socketUrl =
      Config.SOCKET_URL ||
      (Config.BASE_API_URL
        ? Config.BASE_API_URL.replace(/\/api\/?$/, '')
        : defaultFallback);

    const socketInstance = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Đã kết nối chat socket:', socketInstance.id);
      socketInstance.emit('heartbeat');
      clearHeartbeat();
      heartbeatTimerRef.current = setInterval(() => {
        if (socketInstance.connected) {
          socketInstance.emit('heartbeat');
        }
      }, 30000);
    });

    socketInstance.on(
      'user_status_change',
      (data: {
        userId: string;
        isOnline: boolean;
        lastActive?: string | Date;
      }) => {
        if (!data?.userId) return;
        setOnlineUsers(prev => ({
          ...prev,
          [data.userId]: {
            isOnline: !!data.isOnline,
            lastActive: data.lastActive,
          },
        }));
      },
    );

    socketInstance.on('connect_error', err => {
      console.log('Lỗi kết nối socket:', err.message);
      clearHeartbeat();
    });

    socketInstance.on('disconnect', reason => {
      console.log('Socket ngắt kết nối:', reason);
      clearHeartbeat();
    });

    return () => {
      clearHeartbeat();
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          clearHeartbeat();
          if (socketRef.current?.connected) {
            socketRef.current.disconnect();
          }
        } else if (nextAppState === 'active') {
          if (
            socketRef.current &&
            !socketRef.current.connected &&
            isAuthenticated
          ) {
            socketRef.current.connect();
          }
        }
      },
    );

    return () => subscription.remove();
  }, [isAuthenticated]);

  const isUserOnline = useCallback(
    (userId?: string) => {
      if (!userId) return false;
      return !!onlineUsers[userId]?.isOnline;
    },
    [onlineUsers],
  );

  const getUserLastActive = useCallback(
    (userId?: string) => {
      if (!userId) return null;
      return onlineUsers[userId]?.lastActive;
    },
    [onlineUsers],
  );

  const presenceValue = useMemo(
    () => ({ onlineUsers, isUserOnline, getUserLastActive }),
    [onlineUsers, isUserOnline, getUserLastActive],
  );

  return (
    <SocketContext.Provider value={socket}>
      <PresenceContext.Provider value={presenceValue}>
        {children}
      </PresenceContext.Provider>
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export function usePresence() {
  return useContext(PresenceContext);
}

export function useOnlineStatus(userId?: string) {
  const { isUserOnline, getUserLastActive } = usePresence();
  return {
    isOnline: isUserOnline(userId),
    lastActive: getUserLastActive(userId),
  };
}
