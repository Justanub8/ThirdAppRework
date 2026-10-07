import { Socket } from "socket.io-client";
import React, { useState, useRef } from "react";
import { useAuthStore } from "~/hooks";

export function CallProvider({ children }: { children: React.ReactNode}){
    const { accessToken } = useAuthStore();
    const isAuthenticated = !!accessToken;
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);
}