import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interface/authenticated-request.interface';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Direct Message History

  @Get('history/:otherUserId')
  async getConversation(
    @Req() req: AuthenticatedRequest,
    @Param('otherUserId', ParseIntPipe) otherUserId: number,
  ) {
    const currentUserId = req.user.sub;
    return this.messageService.getConversation(currentUserId, otherUserId);
  }

  // Rooms

  @Post('rooms')
  async createRoom(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRoomDto,
  ) {
    return this.messageService.createRoom(req.user.sub, dto);
  }

  @Get('rooms')
  async getMyRooms(@Req() req: AuthenticatedRequest) {
    return this.messageService.getRoomsForUser(req.user.sub);
  }

  @Get('rooms/:roomId/history')
  async getRoomHistory(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.messageService.getRoomHistory(roomId, req.user.sub);
  }
}
