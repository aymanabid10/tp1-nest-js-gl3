'use client';

import { useState } from 'react';
import { User } from '@/types';

interface Props {
  users: User[];
  onCreate: (name: string | undefined, memberIds: number[]) => Promise<void>;
  onClose: () => void;
}

export default function CreateRoomModal({ users, onCreate, onClose }: Props) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  function toggle(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  async function submit() {
    if (!selected.size) { alert('Select at least one member.'); return; }
    setLoading(true);
    try {
      await onCreate(name.trim() || undefined, [...selected]);
      onClose();
    } catch (e) {
      const err = e as Error;
      alert('Error: ' + (err.message ?? 'Could not create room'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl shadow-indigo-500/20 w-full max-w-sm mx-4 overflow-hidden animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-white/60">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Create a Group</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Select members to start chatting</p>
        </div>
        <div className="px-8 py-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Group Name <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Alpha"
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-white transition-all shadow-inner placeholder-slate-400 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Add Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-white/30 border border-white/60 rounded-xl p-2 shadow-inner">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/60 cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={(e) => toggle(u.id, e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-900 transition-colors">{u.username ?? u.email}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-8 py-5 flex gap-3 border-t border-white/60 bg-white/20">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-white/60 rounded-xl transition-all duration-300">Cancel</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2.5 text-sm font-bold bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 transform hover:-translate-y-0.5">
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
