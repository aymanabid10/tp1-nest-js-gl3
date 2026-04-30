import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReactMessageDto } from './dto/react-message.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, Set<string>>();

  constructor(private readonly messageService: MessageService) {}

  async handleConnection(socket: Socket) {
    console.log(`Client checking connection... socket ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(userId);
          console.log(`User ${userId} fully disconnected.`);
        }
        break;
      }
    }
  }

  // Register & auto-join rooms

  @SubscribeMessage('register')
  async handleRegister(@ConnectedSocket() socket: any) {
    const userId = socket.user.id;
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socket.id);

    // Auto-join all Socket.IO rooms the user belongs to
    const rooms = await this.messageService.getRoomsForUser(userId);
    for (const room of rooms) {
      await socket.join(`room:${room.id}`);
    }

    console.log(`User ${userId} registered, joined ${rooms.length} rooms`);
    return {
      success: true,
      rooms: rooms.map((r) => ({ id: r.id, name: r.name, type: r.type, members: r.members })),
    };
  }

  // Direct Messages 

  @SubscribeMessage('sendMessage')
  async handleMessage(@ConnectedSocket() socket: any, @MessageBody() dto: CreateMessageDto) {
    const senderId = socket.user.id;
    const savedMessage = await this.messageService.saveMessage(senderId, dto);

    const payload = {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      receiverId: savedMessage.receiverId,
      replyToId: savedMessage.replyToId,
      createdAt: savedMessage.createdAt,
    };

    const receiverSockets = this.connectedUsers.get(dto.receiverId);
    if (receiverSockets) {
      receiverSockets.forEach((socketId) => {
        this.server.to(socketId).emit('receiveMessage', payload);
      });
    }
    return payload;
  }

  @SubscribeMessage('reactToMessage')
  async handleReaction(@ConnectedSocket() socket: any, @MessageBody() reactDto: ReactMessageDto) {
    const userId = socket.user.id;
    const reactionResult = await this.messageService.reactToMessage(userId, reactDto);
    const message = await this.messageService.findOne(reactDto.messageId);

    if (message) {
      const payload = {
        messageId: message.id,
        userId,
        emoji: reactDto.emoji,
        removed: (reactionResult as any).removed || false,
      };

      if (message.senderId !== userId) {
        const senderSockets = this.connectedUsers.get(message.senderId);
        if (senderSockets) senderSockets.forEach((s) => this.server.to(s).emit('messageReaction', payload));
      }
      if (message.receiverId !== userId) {
        const receiverSockets = this.connectedUsers.get(message.receiverId);
        if (receiverSockets) receiverSockets.forEach((s) => this.server.to(s).emit('messageReaction', payload));
      }
      return payload;
    }
  }

  // Room Events 
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() socket: any, @MessageBody() data: { roomId: number }) {
    const userId = socket.user.id;
    const isMember = await this.messageService.isMember(data.roomId, userId);
    if (!isMember) return { success: false, error: 'Not a member of this room' };
    await socket.join(`room:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@ConnectedSocket() socket: any, @MessageBody() data: { roomId: number }) {
    await socket.leave(`room:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('sendRoomMessage')
  async handleRoomMessage(
    @ConnectedSocket() socket: any,
    @MessageBody() dto: { roomId: number; content: string; replyToId?: number },
  ) {
    const senderId = socket.user.id;
    const savedMessage = await this.messageService.saveRoomMessage(senderId, {
      roomId: dto.roomId,
      content: dto.content,
      replyToId: dto.replyToId,
    });

    const payload = {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      roomId: savedMessage.roomId,
      replyToId: savedMessage.replyToId,
      createdAt: savedMessage.createdAt,
    };

    // Broadcast to every socket in the room (all members)
    this.server.to(`room:${dto.roomId}`).emit('roomMessage', payload);
    return payload;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: any,
    @MessageBody() dto: { roomId?: number; receiverId?: number; isTyping: boolean },
  ) {
    const senderId = socket.user.id;
    const payload = { senderId, isTyping: dto.isTyping };

    if (dto.roomId) {
      // Broadcast to room but not back to sender (to avoid self-typing display if any)
      socket.to(`room:${dto.roomId}`).emit('typing', { ...payload, roomId: dto.roomId });
    } else if (dto.receiverId) {
      const receiverSockets = this.connectedUsers.get(dto.receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((s) => socket.to(s).emit('typing', payload));
      }
    }
  }
}
