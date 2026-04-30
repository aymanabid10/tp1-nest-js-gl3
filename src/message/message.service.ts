import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { GenericService } from '../common/services/generic.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReactMessageDto } from './dto/react-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendRoomMessageDto } from './dto/send-room-message.dto';

@Injectable()
export class MessageService extends GenericService<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageReaction)
    private readonly reactionRepository: Repository<MessageReaction>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
  ) {
    super(messageRepository);
  }

  // Direct Message Methods 

  async saveMessage(senderId: number, createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepository.create({
      content: createMessageDto.content,
      senderId: senderId,
      receiverId: createMessageDto.receiverId,
      replyToId: createMessageDto.replyToId,
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
      relations: ['sender', 'receiver', 'replyTo', 'reactions', 'reactions.user'],
    });
  }

  async reactToMessage(userId: number, reactDto: ReactMessageDto): Promise<MessageReaction | { removed: boolean }> {
    const existing = await this.reactionRepository.findOne({
      where: { userId, messageId: reactDto.messageId, emoji: reactDto.emoji },
    });

    if (existing) {
      await this.reactionRepository.remove(existing);
      return { removed: true, ...existing };
    }

    const newReaction = this.reactionRepository.create({
      userId,
      messageId: reactDto.messageId,
      emoji: reactDto.emoji,
    });
    return this.reactionRepository.save(newReaction);
  }

  // Room Methods 

  async createRoom(creatorId: number, dto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create({
      name: dto.name,
      type: dto.type,
      createdBy: creatorId,
    });
    const savedRoom = await this.roomRepository.save(room);

    // Add creator + all specified members
    const memberIds = [...new Set([creatorId, ...dto.memberIds])];
    const members = memberIds.map((userId) =>
      this.roomMemberRepository.create({ roomId: savedRoom.id, userId }),
    );
    await this.roomMemberRepository.save(members);

    return this.roomRepository.findOne({
      where: { id: savedRoom.id },
      relations: ['members', 'members.user'],
    }) as Promise<Room>;
  }

  async getRoomsForUser(userId: number): Promise<Room[]> {
    return this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.members', 'member', 'member.userId = :userId', { userId })
      .leftJoinAndSelect('room.members', 'allMembers')
      .leftJoinAndSelect('allMembers.user', 'user')
      .orderBy('room.createdAt', 'DESC')
      .getMany();
  }

  async isMember(roomId: number, userId: number): Promise<boolean> {
    const member = await this.roomMemberRepository.findOne({
      where: { roomId, userId },
    });
    return !!member;
  }

  async getRoomHistory(roomId: number, userId: number): Promise<Message[]> {
    const member = await this.isMember(roomId, userId);
    if (!member) throw new ForbiddenException('You are not a member of this room');

    return this.messageRepository.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      relations: ['sender', 'replyTo', 'reactions', 'reactions.user'],
    });
  }

  async saveRoomMessage(senderId: number, dto: SendRoomMessageDto): Promise<Message> {
    const member = await this.isMember(dto.roomId, senderId);
    if (!member) throw new ForbiddenException('You are not a member of this room');

    const message = this.messageRepository.create({
      content: dto.content,
      senderId,
      roomId: dto.roomId,
      replyToId: dto.replyToId,
    });
    return this.messageRepository.save(message);
  }

  async getRoomMembers(roomId: number): Promise<RoomMember[]> {
    return this.roomMemberRepository.find({
      where: { roomId },
      relations: ['user'],
    });
  }
}
