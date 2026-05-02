'use client';

interface Props {
  text: string | null;
}

export default function TypingIndicator({ text }: Props) {
  if (!text) return null;
  return (
    <div className="px-6 pb-4 flex items-center gap-3 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-md border border-white/60 text-slate-800 rounded-[1.25rem] rounded-tl-sm shadow-sm px-4 py-2.5 w-max flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 opacity-80">{text}</span>
        <div className="flex gap-1 items-center ml-1">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
