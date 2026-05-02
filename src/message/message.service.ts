import { Injectable, ForbiddenException } from '@nestjs/common';
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
import { PaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import { DmMessageSender } from './strategies/dm-message.sender';
import { RoomMessageSender } from './strategies/room-message.sender';
import { MessageSenderStrategy } from './strategies/message-sender.strategy';

export interface ReactionPayload {
  messageId: number;
  userId: number;
  emoji: string;
  removed: boolean;
}

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

  // Strategy dispatcher 

  sendMessage(strategy: MessageSenderStrategy): Promise<Message> {
    return strategy.send();
  }

  // Build a DM sending strategy 
  createDmSender(senderId: number, dto: CreateMessageDto): DmMessageSender {
    return new DmMessageSender(senderId, dto, this.messageRepository);
  }

  //  Build a room sending strategy 
  createRoomSender(senderId: number, dto: SendRoomMessageDto): RoomMessageSender {
    return new RoomMessageSender(
      senderId,
      dto,
      this.messageRepository,
      this.roomMemberRepository,
    );
  }

  // Direct Messages 

  getConversation(
    user1Id: number,
    user2Id: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Message>> {
    return this.findAllPaginated(pagination.page, pagination.limit, {
      where: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver', 'replyTo', 'reactions', 'reactions.user'],
    });
  }

  async reactToMessage(
    userId: number,
    reactDto: ReactMessageDto,
  ): Promise<MessageReaction | { removed: boolean }> {
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

  // Handles a reaction toggle and returns a ready-to-emit payload plus
  // the list of user IDs that should be notified 
 
  async reactAndBuildPayload(
    userId: number,
    reactDto: ReactMessageDto,
  ): Promise<{ payload: ReactionPayload; notifyUserIds: number[] } | null> {
    const reaction = await this.reactToMessage(userId, reactDto);

    const message = await this.findOne(reactDto.messageId);
    if (!message) return null;

    const payload: ReactionPayload = {
      messageId: message.id,
      userId,
      emoji: reactDto.emoji,
      removed: (reaction as any).removed ?? false,
    };

    // Determine who should be notified (sender + receiver, excluding reactor)
    const notifyUserIds = [message.senderId, message.receiverId].filter(
      (id): id is number => id !== undefined && id !== null && id !== userId,
    );

    return { payload, notifyUserIds };
  }

  // Rooms

  async createRoom(creatorId: number, dto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create({
      name: dto.name,
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

  getRoomsForUser(userId: number): Promise<Room[]> {
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

  async getRoomHistory(
    roomId: number,
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Message>> {
    const member = await this.isMember(roomId, userId);
    if (!member) throw new ForbiddenException('You are not a member of this room');

    return this.findAllPaginated(pagination.page, pagination.limit, {
      where: { roomId },
      order: { createdAt: 'DESC' },
      relations: ['sender', 'replyTo', 'reactions', 'reactions.user'],
    });
  }

  getRoomMembers(roomId: number): Promise<RoomMember[]> {
    return this.roomMemberRepository.find({
      where: { roomId },
      relations: ['user'],
    });
  }

  // Presence helpers 

    // Users who share at least one room with them
    // Users they have exchanged a direct message with

  async getContactUserIds(userId: number): Promise<number[]> {
    const [roomContacts, dmContacts] = await Promise.all([
      // Room contacts
      this.roomMemberRepository
        .createQueryBuilder('rm')
        .select('rm.userId', 'userId')
        .distinct(true)
        .innerJoin(
          RoomMember,
          'myMembership',
          'myMembership.roomId = rm.roomId AND myMembership.userId = :userId',
          { userId },
        )
        .where('rm.userId != :userId', { userId })
        .getRawMany<{ userId: number }>(),

      // DM contacts
      this.messageRepository
        .createQueryBuilder('m')
        .select(
          `CASE WHEN m.senderId = :userId THEN m.receiverId ELSE m.senderId END`,
          'userId',
        )
        .distinct(true)
        .where('(m.senderId = :userId OR m.receiverId = :userId)', { userId })
        .andWhere('m.roomId IS NULL')
        .getRawMany<{ userId: number }>(),
    ]);

    // Merge, cast to number, deduplicate, and exclude self and nulls
    const allIds = [
      ...roomContacts.map((r) => Number(r.userId)),
      ...dmContacts.map((r) => Number(r.userId)),
    ].filter((id) => !isNaN(id) && id !== userId);

    return [...new Set(allIds)];
  }
}
