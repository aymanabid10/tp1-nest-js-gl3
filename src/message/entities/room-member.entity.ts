import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Room } from './room.entity';

@Entity('room_members')
@Unique(['roomId', 'userId'])
export class RoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column()
  roomId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
