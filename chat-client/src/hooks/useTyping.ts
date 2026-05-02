'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

const TYPING_TIMEOUT = 1500;

interface TypingPayload {
  senderId: number;
  isTyping: boolean;
  roomId?: number;
}

export function useTyping(
  socket: Socket | null,
  currentRoomId: number | null,
  currentDmUserId: number | null,
  myUserId: number,
) {
  const [typingText, setTypingText] = useState<string | null>(null);
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket) return;
      if (currentRoomId) {
        socket.emit('typing', { roomId: currentRoomId, isTyping });
      } else if (currentDmUserId) {
        socket.emit('typing', { receiverId: currentDmUserId, isTyping });
      }
    },
    [socket, currentRoomId, currentDmUserId],
  );

  const handleTypingInput = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping(true);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitTyping(false);
    }, TYPING_TIMEOUT);
  }, [emitTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (payload: TypingPayload) => {
      if (payload.senderId === myUserId) return;
      const isCurrentChat =
        (currentRoomId && payload.roomId === currentRoomId) ||
        (!currentRoomId && !payload.roomId);

      if (!isCurrentChat) return;
      setTypingText(payload.isTyping ? 'Someone is typing' : null);
    };

    socket.on('typing', handleTyping);
    return () => {
      socket.off('typing', handleTyping);
    };
  }, [socket, currentRoomId, myUserId]);

  // Clear typing indicator when switching chat
  useEffect(() => {
    setTypingText(null);
  }, [currentRoomId, currentDmUserId]);

  return { typingText, handleTypingInput };
}
