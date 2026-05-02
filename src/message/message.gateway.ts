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
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessageService } from './message.service';
import { PresenceService } from './presence.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReactMessageDto } from './dto/react-message.dto';
import { SendRoomMessageDto } from './dto/send-room-message.dto';
import type { AuthenticatedSocket } from './types/authenticated-socket.interface';
import { GATEWAY_OPTIONS } from './constants/gateway.config';

@WebSocketGateway(GATEWAY_OPTIONS)
@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessageGateway.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly presenceService: PresenceService,
  ) {}

  handleConnection(socket: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    const userId = this.presenceService.removeSocket(socket.id);
    if (userId) {
      this.logger.log(`User ${userId} fully disconnected.`);
      void this.notifyContacts(userId, 'userOffline', { userId });
    }
  }

  // Registration 

  @SubscribeMessage('register')
  async handleRegister(@ConnectedSocket() socket: AuthenticatedSocket) {
    const userId = socket.user.id;
    this.presenceService.addSocket(userId, socket.id);

    const rooms = await this.messageService.getRoomsForUser(userId);
    for (const room of rooms) {
      await socket.join(`room:${room.id}`);
    }

    void this.notifyContacts(userId, 'userOnline', { userId });
    this.logger.log(`User ${userId} registered, joined ${rooms.length} rooms`);

    return {
      success: true,
      onlineUserIds: this.presenceService.getOnlineUserIds(),
      rooms: rooms.map((r) => ({ id: r.id, name: r.name, members: r.members })),
    };
  }

  // Direct Messages 
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: CreateMessageDto,
  ) {
    const strategy = this.messageService.createDmSender(socket.user.id, dto);
    const saved = await this.messageService.sendMessage(strategy);

    this.emitToUser(dto.receiverId, 'receiveMessage', saved);
    return saved;
  }

  //Room Events 
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    const isMember = await this.messageService.isMember(data.roomId, socket.user.id);
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
    const strategy = this.messageService.createRoomSender(socket.user.id, dto);
    const saved = await this.messageService.sendMessage(strategy);

    this.server.to(`room:${dto.roomId}`).emit('roomMessage', saved);
    return saved;
  }

  // Reactions 

  @SubscribeMessage('reactToMessage')
  async handleReaction(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: ReactMessageDto,
  ) {
    const result = await this.messageService.reactAndBuildPayload(socket.user.id, dto);
    if (!result) return;

    const { payload, notifyUserIds } = result;
    notifyUserIds.forEach((id) => this.emitToUser(id, 'messageReaction', payload));
    return payload;
  }

  // Typing 

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: { roomId?: number; receiverId?: number; isTyping: boolean },
  ) {
    const payload = { senderId: socket.user.id, isTyping: dto.isTyping };

    if (dto.roomId) {
      socket.to(`room:${dto.roomId}`).emit('typing', { ...payload, roomId: dto.roomId });
    } else if (dto.receiverId) {
      this.emitToUser(dto.receiverId, 'typing', payload);
    }
  }

  // Private helpers

  //Emit an event to all active sockets of a given user (if online)
  private emitToUser(userId: number, event: string, payload: object): void {
    if (!this.presenceService.isOnline(userId)) return;
    this.presenceService.getSocketIds(userId)?.forEach((s) =>
      this.server.to(s).emit(event, payload),
    );
  }

  // Emit an event to all online contacts of a given user
  private async notifyContacts(userId: number, event: string, payload: object): Promise<void> {
    const contactIds = await this.messageService.getContactUserIds(userId);
    contactIds.forEach((contactId) => this.emitToUser(contactId, event, payload));
  }
}
