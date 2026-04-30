import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { GenericService } from '../common/services/generic.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService extends GenericService<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    super(messageRepository);
  }

  async saveMessage(senderId: number, createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepository.create({
      content: createMessageDto.content,
      senderId: senderId,
      receiverId: createMessageDto.receiverId,
    });
    
    return this.messageRepository.save(newMessage);
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }
}
