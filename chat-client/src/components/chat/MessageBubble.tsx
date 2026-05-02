'use client';

import { useEffect, useState } from 'react';
import { Message, ReactionEvent } from '@/types';

interface Props {
  msg: Message;
  isSent: boolean;
  reactions: ReactionEvent[];
  onReact: (messageId: number, emoji: string) => void;
  onReply: (msg: Message) => void;
}

const EMOJIS = ['👍', '❤️', '😂'];

export default function MessageBubble({ msg, isSent, reactions, onReact, onReply }: Props) {
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const senderName = msg.sender
    ? msg.sender.username || msg.sender.email
    : `User ${msg.senderId}`;

  const bubbleClass = isSent
    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[1.25rem] rounded-tr-sm shadow-[0_4px_14px_rgba(99,102,241,0.3)]'
    : 'bg-white/80 backdrop-blur-md border border-white/60 text-slate-800 rounded-[1.25rem] rounded-tl-sm shadow-sm';

  const replyStyles = isSent
    ? 'bg-white/10 text-indigo-50 border-l-2 border-indigo-200 backdrop-blur-sm'
    : 'bg-white/50 text-slate-600 border-l-2 border-slate-300 backdrop-blur-sm';

  const [resolvedReplyContent, setResolvedReplyContent] = useState<string | null>(
    msg.replyTo?.content ?? null
  );

  useEffect(() => {
    if (msg.replyToId && !resolvedReplyContent) {
      const repliedMsgEl = document.getElementById(`msg-${msg.replyToId}`);
      if (repliedMsgEl) {
        const p = repliedMsgEl.querySelector('p.break-words') as HTMLElement;
        if (p) {
          setResolvedReplyContent(p.innerText);
          return;
        }
      }
      setResolvedReplyContent("Message snippet...");
    }
  }, [msg.replyToId, resolvedReplyContent]);

  const displayReplyContent = resolvedReplyContent
    ? resolvedReplyContent.length > 60
      ? resolvedReplyContent.substring(0, 60) + '…'
      : resolvedReplyContent
    : null;

  const showReply = !!msg.replyToId;

  return (
    <div id={`msg-${msg.id}`} className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'} animate-pop`}>
      <div className="max-w-[75%] relative group flex flex-col">

        {/* Hover action toolbar */}
        <div className={`absolute ${isSent ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 flex items-center gap-1 bg-white/90 backdrop-blur-md shadow-lg border border-white/60 rounded-full px-2 py-1 z-10 w-max`}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(msg.id, emoji)}
              className="hover:bg-slate-100/80 p-1.5 rounded-full text-base leading-none transition-transform hover:scale-125 active:scale-95"
            >
              {emoji}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-200/80 mx-1" />
          <button
            onClick={() => onReply(msg)}
            className="hover:text-indigo-600 text-slate-400 p-1.5 rounded-full text-xs transition-colors hover:bg-slate-100/80"
            title="Reply"
          >
            ↩
          </button>
        </div>

        {/* Reply preview */}
        {showReply && (
          <div
            className={`flex flex-col text-[11px] ${replyStyles} rounded-md px-2 py-1 mb-1 shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => {
              document.getElementById(`msg-${msg.replyToId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <span className="font-semibold opacity-90 flex items-center gap-1">↩ Replied</span>
            <span className="truncate max-w-[200px] opacity-90 italic">&ldquo;{displayReplyContent || 'Message snippet...'}&rdquo;</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`${bubbleClass} px-5 py-3 relative transition-all duration-300 hover:shadow-md`}>
          {!isSent && msg.roomId && (
            <div className="text-[10px] font-bold text-slate-500 mb-1 ml-0.5 opacity-80 uppercase tracking-wider">
              {senderName}
            </div>
          )}
          <p className="text-sm break-words leading-relaxed">{msg.content}</p>
          <div className={`text-[10px] ${isSent ? 'text-indigo-100' : 'text-slate-400'} text-right mt-1.5 font-medium tracking-wide`}>
            #{msg.id} · {time}
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className={`absolute -bottom-3 ${isSent ? 'right-4' : 'left-4'} flex gap-1 flex-wrap z-20`}>
              {Object.entries(
                reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className="bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-full px-2 py-0.5 text-xs transform transition-transform hover:scale-110 cursor-default flex items-center gap-1"
                >
                  {emoji}
                  {count > 1 && <span className="font-bold text-[10px] text-slate-500 ml-0.5">{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
