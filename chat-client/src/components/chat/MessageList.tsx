'use client';

import { useEffect, useRef } from 'react';
import { Message, ReactionEvent } from '@/types';
import MessageBubble from './MessageBubble';

interface Props {
  chatTargetId: string;
  messages: Message[];
  myUserId: number;
  reactions: Map<number, ReactionEvent[]>;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onReact: (messageId: number, emoji: string) => void;
  onReply: (msg: Message) => void;
}

export default function MessageList({
  chatTargetId, messages, myUserId, reactions, isLoadingMore, hasMore, onLoadMore, onReact, onReply,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);

  // Scroll to bottom when new messages arrive (only if near bottom) or when chat target changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Force scroll to bottom on chat switch
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [chatTargetId]);

  // Restore scroll position after prepend (loading more)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isLoadingMore) return;
    prevScrollHeight.current = el.scrollHeight;
  }, [isLoadingMore]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isLoadingMore) return;
    if (prevScrollHeight.current > 0) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
  }, [messages, isLoadingMore]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop < 60 && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent"
    >
      {/* Loading older messages indicator */}
      {isLoadingMore && (
        <div className="text-center text-xs text-slate-400 py-2 flex items-center justify-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          Loading older messages...
        </div>
      )}

      {/* Beginning of conversation */}
      {!hasMore && messages.length > 0 && (
        <div className="text-center text-xs text-slate-300 py-2">— Beginning of conversation —</div>
      )}

      {messages.length === 0 && !isLoadingMore && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-sm">No messages yet. Say hello!</p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isSent={msg.senderId === myUserId}
          reactions={reactions.get(msg.id) ?? []}
          onReact={onReact}
          onReply={onReply}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
