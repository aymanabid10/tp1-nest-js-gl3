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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat', // You can remove this or customize it based on your featureContext context
})
@UseGuards(WsJwtGuard)
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users: { userId: socketId }
  private connectedUsers = new Map<number, string>();

  constructor(private readonly messageService: MessageService) {}

  async handleConnection(socket: Socket) {
    // Note: User authentication usually happens in a guard before this is reached,
    // but in NestJS WebSockets, guards are not executed on connection by default.
    // Instead, they are executed when a @SubscribeMessage is hit.
    // To protect the connection phase itself, verify the token manually right here.
    console.log(`Client checking connection... socket ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    // Find and remove the disconnected user.
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected.`);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() socket: any) {
    // After WsJwtGuard passes, the user object is attached to the socket.
    const userId = socket.user.id;
    this.connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
    
    return { success: true, message: `Registered successfully` };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() socket: any, 
    @MessageBody() createMessageDto: CreateMessageDto
  ) {
    const senderId = socket.user.id;

    // Save message to DB
    const savedMessage = await this.messageService.saveMessage(senderId, createMessageDto);

    // Send to recipient if they are online
    const receiverSocketId = this.connectedUsers.get(createMessageDto.receiverId);
    
    // Always attach the necessary metadata to distinguish the structure over socket.
    const messageEventPayload = {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      receiverId: savedMessage.receiverId,
      createdAt: savedMessage.createdAt,
    };

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receiveMessage', messageEventPayload);
    }

    // Acknowledge back to sender
    return messageEventPayload;
  }
}
