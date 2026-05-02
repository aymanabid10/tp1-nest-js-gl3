'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ChatPage from '@/components/chat/ChatPage';

export default function ChatRoute() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <ChatPage />
    </div>
  );
}
