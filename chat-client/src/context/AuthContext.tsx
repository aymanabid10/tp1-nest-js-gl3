'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { parseJwt } from '@/lib/parseJwt';

interface AuthState {
  token: string;
  userId: number;
  email: string;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: '', userId: 0, email: '' });

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chat_token');
    const storedEmail = localStorage.getItem('chat_email');
    if (stored && storedEmail) {
      const decoded = parseJwt(stored);
      if (decoded) {
        setAuth({ token: stored, userId: decoded.sub ?? decoded.userId ?? 0, email: storedEmail });
      }
    }
  }, []);

  const login = useCallback((token: string, email: string) => {
    const decoded = parseJwt(token);
    const userId = decoded?.sub ?? decoded?.userId ?? 0;
    localStorage.setItem('chat_token', token);
    localStorage.setItem('chat_email', email);
    setAuth({ token, userId, email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_email');
    setAuth({ token: '', userId: 0, email: '' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: !!auth.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
