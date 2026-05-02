import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TimestampEntity } from '../../shared/entities/time-stamp.entity';
import { MessageReaction } from './message-reaction.entity';
import { Room } from './room.entity';

@Entity('messages')
export class Message extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({ nullable: true })
  receiverId: number;

  @ManyToOne(() => Message, (message) => message.replies, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'replyToId' })
  replyTo: Message;

  @Column({ nullable: true })
  replyToId: number;

  @OneToMany(() => Message, (message) => message.replyTo)
  replies: Message[];

  @OneToMany(() => MessageReaction, (reaction) => reaction.message)
  reactions: MessageReaction[];

  @ManyToOne(() => Room, (room) => room.messages, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ nullable: true })
  roomId: number;
}
