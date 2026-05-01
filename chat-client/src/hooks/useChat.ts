'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDmHistory, getRoomHistory } from '@/lib/api';
import { Message } from '@/types';
import { Socket } from 'socket.io-client';

const HISTORY_LIMIT = 20;

export function useChat(socket: Socket | null) {
  const { token, userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Current chat target
  const currentDmUserId = useRef<number | null>(null);
  const currentRoomId = useRef<number | null>(null);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const loadDmHistory = useCallback(
    async (targetUserId: number) => {
      currentDmUserId.current = targetUserId;
      currentRoomId.current = null;
      setHistoryPage(1);
      setHistoryTotalPages(1);
      setMessages([]);
      try {
        const result = await getDmHistory(token, targetUserId, 1, HISTORY_LIMIT);
        setHistoryTotalPages(result.totalPages);
        setMessages([...result.data].reverse());
      } catch (e) {
        console.error('Error loading DM history:', e);
      }
    },
    [token],
  );

  const loadRoomHistory = useCallback(
    async (roomId: number) => {
      currentRoomId.current = roomId;
      currentDmUserId.current = null;
      setHistoryPage(1);
      setHistoryTotalPages(1);
      setMessages([]);
      try {
        const result = await getRoomHistory(token, roomId, 1, HISTORY_LIMIT);
        setHistoryTotalPages(result.totalPages);
        setMessages([...result.data].reverse());
      } catch (e) {
        console.error('Error loading room history:', e);
      }
    },
    [token],
  );

  const loadMoreHistory = useCallback(async () => {
    if (isLoadingMore || historyPage >= historyTotalPages) return;
    setIsLoadingMore(true);
    try {
      const nextPage = historyPage + 1;
      let result;
      if (currentRoomId.current) {
        result = await getRoomHistory(token, currentRoomId.current, nextPage, HISTORY_LIMIT);
      } else if (currentDmUserId.current) {
        result = await getDmHistory(token, currentDmUserId.current, nextPage, HISTORY_LIMIT);
      } else return;

      setHistoryPage(nextPage);
      setHistoryTotalPages(result.totalPages);
      // Prepend older messages
      setMessages((prev) => [...[...result.data].reverse(), ...prev]);
    } catch (e) {
      console.error('Error loading more history:', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, historyPage, historyTotalPages, token]);

  const sendDm = useCallback(
    (receiverId: number, content: string, replyToId?: number) => {
      if (!socket) return;
      const payload: Record<string, unknown> = { receiverId, content };
      if (replyToId) payload.replyToId = replyToId;
      socket.emit('sendMessage', payload, (ack: Message) => {
        addMessage(ack);
      });
    },
    [socket, addMessage],
  );

  const sendRoomMessage = useCallback(
    (roomId: number, content: string, replyToId?: number) => {
      if (!socket) return;
      const payload: Record<string, unknown> = { roomId, content };
      if (replyToId) payload.replyToId = replyToId;
      socket.emit('sendRoomMessage', payload, (ack: Message) => {
        addMessage(ack);
      });
    },
    [socket, addMessage],
  );

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: Message) => {
      if (
        currentDmUserId.current &&
        (msg.senderId === currentDmUserId.current || msg.receiverId === currentDmUserId.current) &&
        msg.senderId !== userId
      ) {
        addMessage(msg);
      }
    };

    const handleRoomMessage = (msg: Message) => {
      if (currentRoomId.current && msg.roomId === currentRoomId.current) {
        addMessage(msg);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('roomMessage', handleRoomMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('roomMessage', handleRoomMessage);
    };
  }, [socket, userId, addMessage]);

  return {
    messages,
    isLoadingMore,
    hasMore: historyPage < historyTotalPages,
    loadDmHistory,
    loadRoomHistory,
    loadMoreHistory,
    sendDm,
    sendRoomMessage,
    addMessage,
  };
}
