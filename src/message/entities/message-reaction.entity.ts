import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';
import { TimestampEntity } from '../../shared/entities/time-stamp.entity';

@Entity('message_reactions')
export class MessageReaction extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emoji: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Message, message => message.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column()
  messageId: number;
}
