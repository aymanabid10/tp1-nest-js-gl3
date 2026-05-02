'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signIn, signUp } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('user1@test.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'signin') {
        data = await signIn(email, password);
      } else {
        data = await signUp(email, password, username || email.split('@')[0]);
        if (!data.access_token && !data.token) {
          // Auto sign-in after register
          data = await signIn(email, password);
        }
      }
      const token = data.access_token ?? data.token;
      if (token) {
        login(token, email);
        router.push('/chat');
      } else {
        const msg = data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Authentication failed.');
      }
    } catch {
      setError('Cannot reach API. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const tabBase = 'flex-1 py-3 text-sm font-semibold border-b-2 transition-all duration-300';
  const activeTab = `${tabBase} text-indigo-600 border-indigo-600 bg-white/50`;
  const inactiveTab = `${tabBase} text-slate-500 border-transparent hover:bg-white/20 hover:text-slate-700`;

  return (
    <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="px-10 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6 shadow-lg shadow-indigo-200 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome to Chat</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {mode === 'signin' ? 'Sign in to continue' : 'Register a new account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button onClick={() => setMode('signin')} className={mode === 'signin' ? activeTab : inactiveTab}>
            Sign In
          </button>
          <button onClick={() => setMode('signup')} className={mode === 'signup' ? activeTab : inactiveTab}>
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm shadow-inner"
                placeholder="johndoe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm shadow-inner"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm shadow-inner"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:transform-none text-sm shadow-lg shadow-indigo-200"
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </div>
  );
}
