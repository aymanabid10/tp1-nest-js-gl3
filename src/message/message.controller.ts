import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interface/authenticated-request.interface';
import { CreateRoomDto } from './dto/create-room.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Direct Messages

  @Get('history/:otherUserId')
  getConversation(
    @Req() req: AuthenticatedRequest,
    @Param('otherUserId', ParseIntPipe) otherUserId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.messageService.getConversation(req.user.sub, otherUserId, pagination);
  }

  //Rooms 

  @Post('rooms')
  createRoom(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRoomDto,
  ) {
    return this.messageService.createRoom(req.user.sub, dto);
  }

  @Get('rooms')
  getMyRooms(@Req() req: AuthenticatedRequest) {
    return this.messageService.getRoomsForUser(req.user.sub);
  }

  @Get('rooms/:roomId/history')
  getRoomHistory(
    @Req() req: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.messageService.getRoomHistory(roomId, req.user.sub, pagination);
  }
}
