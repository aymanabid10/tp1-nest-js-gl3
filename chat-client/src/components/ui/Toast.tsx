'use client';

import { useEffect, useRef, useState } from 'react';

export interface ToastData {
  id: string;
  title: string;
  content: string;
  avatarColor: string;
  initials: string;
  onClick?: () => void;
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      onClick={() => { onRemove(toast.id); toast.onClick?.(); }}
      className={`bg-white/80 backdrop-blur-xl pointer-events-auto border text-left border-white/60 shadow-xl shadow-indigo-500/10 rounded-2xl p-4 w-80 transform transition-all duration-500 cursor-pointer hover:bg-white/90 hover:scale-[1.02] flex gap-3 items-start relative overflow-hidden ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${toast.avatarColor} shadow-[0_0_8px_currentColor] opacity-80`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${toast.avatarColor} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm shadow-md`}>
        {toast.initials}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-sm font-extrabold text-slate-800 tracking-tight truncate">{toast.title}</div>
        <div className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {toast.content.length > 80 ? toast.content.substring(0, 80) + '...' : toast.content}
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
