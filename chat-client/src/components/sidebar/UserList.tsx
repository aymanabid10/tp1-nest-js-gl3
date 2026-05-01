'use client';

import { User } from '@/types';

interface Props {
  users: User[];
  onlineUsers: Set<number>;
  unreadCounts: Record<number, number>;
  selectedUserId: number | null;
  searchQuery: string;
  onSearch: (q: string) => void;
  onSelect: (user: User) => void;
}

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-orange-400 to-red-500',
  'from-pink-500 to-rose-500',
];

export function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

export default function UserList({ users, onlineUsers, unreadCounts, selectedUserId, searchQuery, onSearch, onSelect }: Props) {
  const filtered = users.filter((u) =>
    (u.username ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-5 pt-5 pb-3 bg-transparent">
        <div className="flex items-center gap-3 bg-white/50 border border-white/60 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white transition-all duration-300">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400/80 font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No users found</p>
        ) : (
          filtered.map((u) => {
            const initials = (u.username ?? u.email).charAt(0).toUpperCase();
            const displayName = u.username ?? u.email;
            const color = getAvatarColor(u.id);
            const online = onlineUsers.has(u.id);
            const unread = unreadCounts[u.id] ?? 0;
            const isActive = selectedUserId === u.id;

            return (
              <div
                key={u.id}
                onClick={() => onSelect(u)}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group border ${
                  isActive ? 'bg-white/80 shadow-md border-white/60 transform scale-[1.02]' : 'bg-white/30 border-transparent hover:bg-white/60 hover:shadow-sm hover:border-white/40'
                }`}
              >
                <div className="relative w-11 h-11 flex-shrink-0">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white font-bold text-base shadow-inner`}>
                    {initials}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-[3px] border-[#f4f7fb] rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{displayName}</p>
                  <p className={`text-xs mt-0.5 ${online ? 'text-emerald-500 font-bold tracking-wide' : 'text-slate-400 font-medium'}`}>
                    {online ? 'Online' : 'Offline'}
                  </p>
                </div>
                {unread > 0 && (
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-lg shadow-rose-200/50">
                    {unread}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
