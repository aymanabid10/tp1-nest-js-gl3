import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { PresenceService } from './presence.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReactMessageDto } from './dto/react-message.dto';
import { SendRoomMessageDto } from './dto/send-room-message.dto';
import type { AuthenticatedSocket } from './types/authenticated-socket.interface';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessageGateway.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly presenceService: PresenceService,
  ) {}

  // Lifecycle 
  handleConnection(socket: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    const userId = this.presenceService.removeSocket(socket.id);
    if (userId) {
      this.logger.log(`User ${userId} fully disconnected.`);
      // Notify only the contacts of this user, not everyone
      void this.notifyContacts(userId, 'userOffline', { userId });
    }
  }

  //  Register & Auto-join Rooms 

  @SubscribeMessage('register')
  async handleRegister(@ConnectedSocket() socket: AuthenticatedSocket) {
    const userId = socket.user.id;
    this.presenceService.addSocket(userId, socket.id);

    const rooms = await this.messageService.getRoomsForUser(userId);
    for (const room of rooms) {
      await socket.join(`room:${room.id}`);
    }

    // Notify only relevant contacts (room-mates & DM partners) that this user came online
    void this.notifyContacts(userId, 'userOnline', { userId });

    this.logger.log(`User ${userId} registered, joined ${rooms.length} rooms`);
    return {
      success: true,
      onlineUserIds: this.presenceService.getOnlineUserIds(),
      rooms: rooms.map((r) => ({ id: r.id, name: r.name, members: r.members })),
    };
  }

  // Send an event only to the online sockets of a user's contacts
  private async notifyContacts(userId: number, event: string, payload: object): Promise<void> {
    const contactIds = await this.messageService.getContactUserIds(userId);
    for (const contactId of contactIds) {
      if (this.presenceService.isOnline(contactId)) {
        const sockets = this.presenceService.getSocketIds(contactId);
        sockets?.forEach((s) => this.server.to(s).emit(event, payload));
      }
    }
  }

  // Direct Messages 

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: CreateMessageDto,
  ) {
    const senderId = socket.user.id;
    const savedMessage = await this.messageService.saveMessage(senderId, dto);

    if (this.presenceService.isOnline(dto.receiverId)) {
      const receiverSockets = this.presenceService.getSocketIds(dto.receiverId);
      receiverSockets!.forEach((socketId) => {
        this.server.to(socketId).emit('receiveMessage', savedMessage);
      });
    }
    return savedMessage;
  }

  @SubscribeMessage('reactToMessage')
  async handleReaction(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() reactDto: ReactMessageDto,
  ) {
    const userId = socket.user.id;
    const { reaction, message } = await this.messageService.reactToMessageWithContext(userId, reactDto);

    if (!message) return;

    const payload = {
      messageId: message.id,
      userId,
      emoji: reactDto.emoji,
      removed: (reaction as any).removed || false,
    };

    // Notify both parties  sender and receiver of the original message
    const notifyUserIds = [message.senderId, message.receiverId].filter(
      (id) => id !== undefined && id !== userId,
    ) as number[];

    for (const targetId of notifyUserIds) {
      const sockets = this.presenceService.getSocketIds(targetId);
      if (sockets) {
        sockets.forEach((s) => this.server.to(s).emit('messageReaction', payload));
      }
    }

    return payload;
  }

  // Room Events 

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    const userId = socket.user.id;
    const isMember = await this.messageService.isMember(data.roomId, userId);
    if (!isMember) return { success: false, error: 'Not a member of this room' };
    await socket.join(`room:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    await socket.leave(`room:${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('sendRoomMessage')
  async handleRoomMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: SendRoomMessageDto,
  ) {
    const senderId = socket.user.id;
    const savedMessage = await this.messageService.saveRoomMessage(senderId, dto);

    this.server.to(`room:${dto.roomId}`).emit('roomMessage', savedMessage);
    return savedMessage;
  }


  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: { roomId?: number; receiverId?: number; isTyping: boolean },
  ) {
    const senderId = socket.user.id;
    const payload = { senderId, isTyping: dto.isTyping };

    if (dto.roomId) {
      socket.to(`room:${dto.roomId}`).emit('typing', { ...payload, roomId: dto.roomId });
    } else if (dto.receiverId) {
      const receiverSockets = this.presenceService.getSocketIds(dto.receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((s) => socket.to(s).emit('typing', payload));
      }
    }
  }
}
