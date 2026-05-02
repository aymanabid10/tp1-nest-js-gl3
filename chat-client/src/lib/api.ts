import { Message, PaginatedResult, Room, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signUp(email: string, password: string, username: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  });
  return res.json();
}

export function getUsers(token: string): Promise<User[] | PaginatedResult<User>> {
  return apiFetch('/user', token);
}

export function getDmHistory(
  token: string,
  userId: number,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<Message>> {
  return apiFetch(`/messages/history/${userId}?page=${page}&limit=${limit}`, token);
}

export function getRoomHistory(
  token: string,
  roomId: number,
  page = 1,
  limit = 20,
): Promise<PaginatedResult<Message>> {
  return apiFetch(`/messages/rooms/${roomId}/history?page=${page}&limit=${limit}`, token);
}

export function getRooms(token: string): Promise<Room[]> {
  return apiFetch('/messages/rooms', token);
}

export function createRoom(
  token: string,
  dto: { name?: string; memberIds: number[] },
): Promise<Room> {
  return apiFetch('/messages/rooms', token, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
