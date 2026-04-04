import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
import { TimestampEntity } from 'src/shared/entities/time-stamp.entity';

@Entity()
export class Skill extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  designation!: string;

  @ManyToMany(() => Cv, (cv) => cv.skills)
  cvs!: Cv[];
}
