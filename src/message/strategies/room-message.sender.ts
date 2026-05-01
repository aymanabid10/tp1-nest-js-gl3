import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { RoomMember } from '../entities/room-member.entity';
import { SendRoomMessageDto } from '../dto/send-room-message.dto';
import { MessageSenderStrategy } from './message-sender.strategy';

export class RoomMessageSender implements MessageSenderStrategy {
  constructor(
    private readonly senderId: number,
    private readonly dto: SendRoomMessageDto,
    private readonly messageRepository: Repository<Message>,
    private readonly roomMemberRepository: Repository<RoomMember>,
  ) {}

  async send(): Promise<Message> {
    const member = await this.roomMemberRepository.findOne({
      where: { roomId: this.dto.roomId, userId: this.senderId },
    });
    if (!member) throw new ForbiddenException('You are not a member of this room');

    const message = this.messageRepository.create({
      content: this.dto.content,
      senderId: this.senderId,
      roomId: this.dto.roomId,
      replyToId: this.dto.replyToId,
    });
    return this.messageRepository.save(message);
  }
}
