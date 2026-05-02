import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageSenderStrategy } from './message-sender.strategy';

export class DmMessageSender implements MessageSenderStrategy {
  constructor(
    private readonly senderId: number,
    private readonly dto: CreateMessageDto,
    private readonly messageRepository: Repository<Message>,
  ) {}

  async send(): Promise<Message> {
    const message = this.messageRepository.create({
      content: this.dto.content,
      senderId: this.senderId,
      receiverId: this.dto.receiverId,
      replyToId: this.dto.replyToId,
    });
    return this.messageRepository.save(message);
  }
}
