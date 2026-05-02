'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useChat } from '@/hooks/useChat';
import { usePresence } from '@/hooks/usePresence';
import { useTyping } from '@/hooks/useTyping';
import { useReactions } from '@/hooks/useReactions';
import { useRooms } from '@/hooks/useRooms';
import { getUsers } from '@/lib/api';
import { Message, Room, User } from '@/types';
import { getAvatarColor } from '@/components/sidebar/UserList';

import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import UserList from '@/components/sidebar/UserList';
import RoomList from '@/components/sidebar/RoomList';
import CreateRoomModal from '@/components/ui/CreateRoomModal';
import ToastContainer, { ToastData } from '@/components/ui/Toast';

type SidebarTab = 'people' | 'rooms';

export default function ChatPage() {
  const { token, userId, email, logout } = useAuth();
  const { socket, isConnected, registeredRooms, initialOnlineUsers } = useSocket();

  // Users
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar & navigation
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('people');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // Unread counts
  const [dmUnread, setDmUnread] = useState<Record<number, number>>({});
  const [roomUnread, setRoomUnread] = useState<Record<number, number>>({});

  // Reply state
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // Hooks
  const currentDmUserId = selectedUser?.id ?? null;
  const currentRoomId = selectedRoom?.id ?? null;

  const chat = useChat(socket);
  const { onlineUsers } = usePresence(socket, initialOnlineUsers);
  const { typingText, handleTypingInput } = useTyping(socket, currentRoomId, currentDmUserId, userId);
  const { reactions, reactTo } = useReactions(socket);
  const { rooms, setRooms, loadRooms, createRoom, joinRoom } = useRooms(token, socket);

  // Seed rooms from socket registration
  useEffect(() => {
    if (registeredRooms.length) setRooms(registeredRooms);
  }, [registeredRooms, setRooms]);

  // Load users on mount
  useEffect(() => {
    getUsers(token)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { data: User[] }).data ?? [];
        setAllUsers(list.filter((u) => u.id !== userId));
      })
      .catch(console.error);
  }, [token, userId]);

  // Listen for unread messages from socket
  useEffect(() => {
    if (!socket) return;

    const handleDm = (msg: Message) => {
      // If not currently viewing this DM, count as unread
      if (!selectedUser || selectedUser.id !== msg.senderId) {
        if (msg.senderId !== userId) {
          setDmUnread((prev) => ({ ...prev, [msg.senderId]: (prev[msg.senderId] ?? 0) + 1 }));
          const sender = allUsers.find((u) => u.id === msg.senderId);
          const name = sender?.username ?? sender?.email ?? 'Someone';
          setToasts((prev) => [...prev, {
            id: `${Date.now()}`,
            title: name,
            content: msg.content,
            avatarColor: getAvatarColor(msg.senderId),
            initials: name.charAt(0).toUpperCase(),
            onClick: () => sender && selectUser(sender),
          }]);
        }
      }
    };

    const handleRoom = (msg: Message) => {
      if (!selectedRoom || selectedRoom.id !== msg.roomId) {
        if (msg.senderId !== userId && msg.roomId != null) {
          setRoomUnread((prev) => ({ ...prev, [msg.roomId!]: (prev[msg.roomId!] ?? 0) + 1 }));
          const room = rooms.find((r) => r.id === msg.roomId);
          const name = room?.name ?? `Room #${msg.roomId}`;
          setToasts((prev) => [...prev, {
            id: `${Date.now()}`,
            title: name,
            content: msg.content,
            avatarColor: 'from-violet-500 to-purple-500',
            initials: '⊞',
            onClick: () => room && selectRoom(room),
          }]);
        }
      }
    };

    socket.on('receiveMessage', handleDm);
    socket.on('roomMessage', handleRoom);
    return () => {
      socket.off('receiveMessage', handleDm);
      socket.off('roomMessage', handleRoom);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedUser, selectedRoom, userId, allUsers, rooms]);

  function selectUser(user: User) {
    setSelectedUser(user);
    setSelectedRoom(null);
    setReplyTo(null);
    setDmUnread((prev) => ({ ...prev, [user.id]: 0 }));
    chat.loadDmHistory(user.id);
  }

  function selectRoom(room: Room) {
    setSelectedRoom(room);
    setSelectedUser(null);
    setReplyTo(null);
    setRoomUnread((prev) => ({ ...prev, [room.id]: 0 }));
    joinRoom(room.id);
    chat.loadRoomHistory(room.id);
  }

  function sendMessage(content: string, replyToId?: number) {
    if (selectedRoom) {
      chat.sendRoomMessage(selectedRoom.id, content, replyToId);
    } else if (selectedUser) {
      chat.sendDm(selectedUser.id, content, replyToId);
    }
    setReplyTo(null);
  }

  // Header info
  const headerName = selectedRoom
    ? (selectedRoom.name ?? `Room #${selectedRoom.id}`)
    : selectedUser
    ? (selectedUser.username ?? selectedUser.email)
    : 'Select a user or room';

  const headerSubtitle = selectedRoom
    ? `${selectedRoom.members?.length ?? 0} members`
    : selectedUser
    ? `ID: ${selectedUser.id}`
    : '';

  const avatarClass = selectedRoom
    ? 'bg-gradient-to-tr from-violet-500 to-purple-500'
    : selectedUser
    ? `bg-gradient-to-tr ${getAvatarColor(selectedUser.id)}`
    : 'bg-slate-200';

  const avatarContent = selectedRoom
    ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
    : selectedUser
    ? (selectedUser.username ?? selectedUser.email).charAt(0).toUpperCase()
    : '?';

  const tabStyle = (tab: SidebarTab) =>
    `flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-[3px] transition-all duration-300 ${
      sidebarTab === tab
        ? 'text-indigo-600 border-indigo-600 bg-white/40'
        : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-white/20'
    }`;

  return (
    <div className="w-full max-w-6xl h-[92vh] bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/40 border-r border-white/60 flex flex-col backdrop-blur-md">
        {/* My profile */}
        <div className="p-6 border-b border-white/60 bg-white/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200/50 text-lg">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-base truncate">{email}</h3>
              <p className="text-xs text-indigo-600/80 font-medium">● Online (ID: {userId})</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/60 bg-white/20">
          <button onClick={() => setSidebarTab('people')} className={tabStyle('people')}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            People
          </button>
          <button onClick={() => { setSidebarTab('rooms'); loadRooms(); }} className={tabStyle('rooms')}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Rooms
          </button>
        </div>

        {/* Panels */}
        {sidebarTab === 'people' ? (
          <UserList
            users={allUsers}
            onlineUsers={onlineUsers}
            unreadCounts={dmUnread}
            selectedUserId={selectedUser?.id ?? null}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onSelect={selectUser}
          />
        ) : (
          <RoomList
            rooms={rooms}
            unreadCounts={roomUnread}
            selectedRoomId={selectedRoom?.id ?? null}
            onSelect={selectRoom}
            onCreateRoom={() => setShowCreateRoom(true)}
          />
        )}

        {/* Logout */}
        <div className="p-5 border-t border-white/60 bg-white/20">
          <button
            onClick={logout}
            className="w-full py-2.5 text-sm font-bold text-slate-600 hover:text-rose-500 hover:bg-white/60 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm relative">
        <ChatHeader
          name={headerName}
          subtitle={headerSubtitle}
          avatarContent={avatarContent}
          avatarClass={avatarClass}
          isConnected={isConnected}
        />

        {selectedUser || selectedRoom ? (
          <>
            <MessageList
              chatTargetId={selectedRoom ? `room_${selectedRoom.id}` : `dm_${selectedUser!.id}`}
              messages={chat.messages}
              myUserId={userId}
              reactions={reactions}
              isLoadingMore={chat.isLoadingMore}
              hasMore={chat.hasMore}
              onLoadMore={chat.loadMoreHistory}
              onReact={reactTo}
              onReply={setReplyTo}
            />
            <TypingIndicator text={typingText} />
            <MessageInput
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              onSend={sendMessage}
              onTyping={handleTypingInput}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-transparent gap-6">
            <div className="w-32 h-32 rounded-[2rem] bg-white/50 border border-white/60 flex items-center justify-center shadow-xl shadow-indigo-100/50 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium text-lg tracking-wide">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* Modals & Toasts */}
      {showCreateRoom && (
        <CreateRoomModal
          users={allUsers}
          onCreate={createRoom}
          onClose={() => setShowCreateRoom(false)}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
