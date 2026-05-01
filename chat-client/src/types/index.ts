export interface User {
  id: number;
  email: string;
  username?: string;
}

export interface Reaction {
  id: number;
  userId: number;
  messageId: number;
  emoji: string;
  user?: User;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  roomId?: number;
  replyToId?: number;
  replyTo?: Message;
  reactions?: Reaction[];
  sender?: User;
  createdAt: string;
}

export interface Room {
  id: number;
  name?: string;
  createdBy: number;
  members?: RoomMember[];
  createdAt: string;
}

export interface RoomMember {
  id: number;
  roomId: number;
  userId: number;
  user?: User;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReactionEvent {
  messageId: number;
  userId: number;
  emoji: string;
  removed: boolean;
}

export type SidebarTab = 'people' | 'rooms';
export type ChatMode = { type: 'dm'; userId: number } | { type: 'room'; roomId: number } | null;
