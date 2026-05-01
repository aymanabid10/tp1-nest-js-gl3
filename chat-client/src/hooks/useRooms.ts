'use client';

import { useCallback, useState } from 'react';
import { createRoom as apiCreateRoom, getRooms } from '@/lib/api';
import { Room } from '@/types';
import { Socket } from 'socket.io-client';

export function useRooms(token: string, socket: Socket | null) {
  const [rooms, setRooms] = useState<Room[]>([]);

  const loadRooms = useCallback(async () => {
    try {
      const data = await getRooms(token);
      setRooms(data);
    } catch (e) {
      console.error('Error loading rooms:', e);
    }
  }, [token]);

  const createRoom = useCallback(
    async (name: string | undefined, memberIds: number[]): Promise<Room> => {
      const room = await apiCreateRoom(token, { name, memberIds });
      setRooms((prev) => [room, ...prev]);
      return room;
    },
    [token],
  );

  const joinRoom = useCallback(
    (roomId: number) => {
      socket?.emit('joinRoom', { roomId });
    },
    [socket],
  );

  return { rooms, setRooms, loadRooms, createRoom, joinRoom };
}
