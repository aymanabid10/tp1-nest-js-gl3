import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
import { Role } from 'src/shared/enums/role.enum';
import { TimestampEntity } from 'src/shared/entities/time-stamp.entity';

@Entity()
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  salt!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @OneToMany(() => Cv, (cv) => cv.user)
  cvs!: Cv[];
}
