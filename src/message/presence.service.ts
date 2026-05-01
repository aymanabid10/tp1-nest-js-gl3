import { Injectable } from '@nestjs/common';

/**
 * Tracks which socket IDs belong to which authenticated users.
 * Extracted from the Gateway to keep the transport layer stateless.
 */
@Injectable()
export class PresenceService {
  private readonly connectedUsers = new Map<number, Set<string>>();

  addSocket(userId: number, socketId: string): void {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
  }

  removeSocket(socketId: string): number | null {
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
        return userId;
      }
    }
    return null;
  }

  getSocketIds(userId: number): Set<string> | undefined {
    return this.connectedUsers.get(userId);
  }

  isOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUserIds(): number[] {
    return Array.from(this.connectedUsers.keys());
  }
}
