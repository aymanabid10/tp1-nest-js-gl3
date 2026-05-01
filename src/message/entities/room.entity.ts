import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TimestampEntity } from '../../shared/entities/time-stamp.entity';
import { Message } from './message.entity';
import { RoomMember } from './room-member.entity';

@Entity('rooms')
export class Room extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column()
  createdBy: number;

  @OneToMany(() => RoomMember, (rm: RoomMember) => rm.room, { cascade: true })
  members: RoomMember[];

  @OneToMany(() => Message, (m) => m.room)
  messages: Message[];
}
