'use client';

import { useRef, useState, useEffect } from 'react';
import { Message } from '@/types';

const COMMON_EMOJIS = ['😀', '😂', '🥰', '😎', '😭', '🥺', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '👀', '💯', '🤔', '🙌', '👏', '💔', '⭐'];

interface Props {
  replyTo: Message | null;
  onCancelReply: () => void;
  onSend: (content: string, replyToId?: number) => void;
  onTyping: () => void;
}

export default function MessageInput({ replyTo, onCancelReply, onSend, onTyping }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  function send() {
    const content = inputRef.current?.value.trim();
    if (!content) return;
    onSend(content, replyTo?.id);
    if (inputRef.current) inputRef.current.value = '';
    onCancelReply();
    setShowEmojiPicker(false);
  }

  const insertEmoji = (emoji: string) => {
    if (inputRef.current) {
      inputRef.current.value += emoji;
      handleResize();
      inputRef.current.focus();
    }
    setShowEmojiPicker(false);
  };

  const handleResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
    onTyping();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="bg-transparent p-4 pb-6">
      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-center justify-between px-6 py-2.5 mx-2 mb-2 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl shadow-sm">
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <span className="text-indigo-500 font-bold">↩</span>
            <span>
              Replying to <em className="font-semibold not-italic text-slate-800">&ldquo;{replyTo.content.substring(0, 60)}{replyTo.content.length > 60 ? '…' : ''}&rdquo;</em>
            </span>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full w-6 h-6 flex items-center justify-center transition-colors">✕</button>
        </div>
      )}

      <div className="flex items-end gap-3 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full p-2 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-indigo-100/50 transition-all duration-300 shadow-md mx-2 relative">
        <div className="relative" ref={pickerRef}>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors text-xl ml-1"
            title="Insert Emoji"
          >
            ☺
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-4 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-3 grid grid-cols-5 gap-2 w-max z-50 animate-pop origin-bottom-left">
              {COMMON_EMOJIS.map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-indigo-50 hover:scale-125 transition-transform rounded-lg text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          ref={inputRef}
          onKeyDown={handleKeyDown}
          onInput={handleResize}
          rows={1}
          className="flex-1 bg-transparent border-none py-2.5 px-2 outline-none text-slate-700 placeholder-slate-400 font-medium text-sm resize-none custom-scrollbar max-h-[120px]"
          placeholder="Type your message..."
        />

        <button
          onClick={send}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
