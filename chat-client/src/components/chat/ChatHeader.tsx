'use client';

interface Props {
  name: string;
  subtitle: string;
  avatarContent: string;
  avatarClass: string;
  isConnected: boolean;
}

export default function ChatHeader({ name, subtitle, avatarContent, avatarClass, isConnected }: Props) {
  return (
    <div className="h-16 px-8 bg-white/40 backdrop-blur-md border-b border-white/60 flex items-center shadow-sm z-10 sticky top-0 transition-all duration-300">
      <div className="relative mr-4 flex-shrink-0">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-inner ${avatarClass.replace('rounded-full', '')}`}
          dangerouslySetInnerHTML={{ __html: avatarContent }}
        />
        {isConnected && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white/80 rounded-full shadow-sm animate-pulse" />
        )}
      </div>
      <div>
        <h2 className="font-extrabold text-slate-800 text-base tracking-tight">{name}</h2>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="ml-auto">
        {/* We can remove the redundant "Connected" pill, or keep it. Let's keep it but make it sleek. */}
        <span className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm ${
          isConnected ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' : 'bg-rose-100/80 text-rose-700 border border-rose-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
}
