'use client';

import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

export function usePresence(socket: Socket | null, initialOnlineIds: number[] = []) {
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set(initialOnlineIds));

  useEffect(() => {
    if (initialOnlineIds.length) {
      setOnlineUsers(new Set(initialOnlineIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOnlineIds.join(',')]);

  useEffect(() => {
    if (!socket) return;

    const onOnline = ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };
    const onOffline = ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('userOnline', onOnline);
    socket.on('userOffline', onOffline);
    return () => {
      socket.off('userOnline', onOnline);
      socket.off('userOffline', onOffline);
    };
  }, [socket]);

  const isOnline = useCallback((userId: number) => onlineUsers.has(userId), [onlineUsers]);

  return { onlineUsers, isOnline };
}
