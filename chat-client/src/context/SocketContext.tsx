'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Room } from '@/types';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  registeredRooms: Room[];
  initialOnlineUsers: number[];
}

const SocketContext = createContext<SocketContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [registeredRooms, setRegisteredRooms] = useState<Room[]>([]);
  const [initialOnlineUsers, setInitialOnlineUsers] = useState<number[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = io(`${API_URL}/chat`, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register', {}, (res: { rooms?: Room[]; onlineUserIds?: number[] }) => {
        if (res?.rooms) setRegisteredRooms(res.rooms);
        if (res?.onlineUserIds) setInitialOnlineUsers(res.onlineUserIds);
      });
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, registeredRooms, initialOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
}
