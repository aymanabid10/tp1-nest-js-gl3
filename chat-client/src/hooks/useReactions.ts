'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { ReactionEvent } from '@/types';

export function useReactions(socket: Socket | null) {
  const [reactions, setReactions] = useState<Map<number, ReactionEvent[]>>(new Map());

  useEffect(() => {
    if (!socket) return;
    const handleReaction = (payload: ReactionEvent) => {
      setReactions((prev) => {
        const next = new Map(prev);
        const msgReactions = [...(next.get(payload.messageId) ?? [])];
        if (payload.removed) {
          const filtered = msgReactions.filter(
            (r) => !(r.userId === payload.userId && r.emoji === payload.emoji),
          );
          next.set(payload.messageId, filtered);
        } else {
          const exists = msgReactions.some(
            (r) => r.userId === payload.userId && r.emoji === payload.emoji,
          );
          if (!exists) msgReactions.push(payload);
          next.set(payload.messageId, msgReactions);
        }
        return next;
      });
    };
    socket.on('messageReaction', handleReaction);
    return () => { socket.off('messageReaction', handleReaction); };
  }, [socket]);

  const reactTo = useCallback(
    (messageId: number, emoji: string) => {
      if (!socket) return;
      socket.emit('reactToMessage', { messageId, emoji }, (ack: ReactionEvent) => {
        if (ack) {
          setReactions((prev) => {
            const next = new Map(prev);
            const msgReactions = [...(next.get(messageId) ?? [])];
            if (ack.removed) {
              next.set(messageId, msgReactions.filter((r) => !(r.userId === ack.userId && r.emoji === ack.emoji)));
            } else {
              if (!msgReactions.some((r) => r.userId === ack.userId && r.emoji === ack.emoji)) {
                msgReactions.push(ack);
              }
              next.set(messageId, msgReactions);
            }
            return next;
          });
        }
      });
    },
    [socket],
  );

  return { reactions, reactTo };
}
