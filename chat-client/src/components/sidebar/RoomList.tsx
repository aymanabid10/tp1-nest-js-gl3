'use client';

import { Room } from '@/types';

interface Props {
  rooms: Room[];
  unreadCounts: Record<number, number>;
  selectedRoomId: number | null;
  onSelect: (room: Room) => void;
  onCreateRoom: () => void;
}

export default function RoomList({ rooms, unreadCounts, selectedRoomId, onSelect, onCreateRoom }: Props) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Rooms</span>
        <button
          onClick={onCreateRoom}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md transform hover:scale-105 active:scale-95 text-sm font-bold"
          title="New Group"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No rooms yet. Create one!</p>
        ) : (
          rooms.map((r) => {
            const name = r.name ?? `Room #${r.id}`;
            const memberCount = r.members?.length ?? 0;
            const unread = unreadCounts[r.id] ?? 0;
            const isActive = selectedRoomId === r.id;

            return (
              <div
                key={r.id}
                onClick={() => onSelect(r)}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group border ${
                  isActive ? 'bg-white/80 shadow-md border-white/60 transform scale-[1.02]' : 'bg-white/30 border-transparent hover:bg-white/60 hover:shadow-sm hover:border-white/40'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm flex-shrink-0 shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors">{name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
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
