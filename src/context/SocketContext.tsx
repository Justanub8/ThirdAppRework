import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '~/hooks';
import Config from 'react-native-config';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const socketUrl =
      Config.SOCKET_URL ||
      (Config.BASE_API_URL ? Config.BASE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5050');

    const socketInstance = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Đã kết nối chat socket:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.log('Lỗi kết nối socket:', err.message);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, accessToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
