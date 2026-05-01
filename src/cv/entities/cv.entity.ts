import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Skill } from '../../skill/entities/skill.entity';
import { TimestampEntity } from 'src/shared/entities/time-stamp.entity';

@Entity()
export class Cv extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  firstname!: string;

  @Column()
  age!: number;

  @Column()
  cin!: string;

  @Column()
  job!: string;

  @Column({ nullable: true })
  path!: string;

  @ManyToOne(() => User, (user) => user.cvs, { eager: true })
  user!: User;

  @ManyToMany(() => Skill, (skill) => skill.cvs, { eager: true })
  @JoinTable() // JoinTable uniquement du côté propriétaire (Cv)
  skills!: Skill[];
}
