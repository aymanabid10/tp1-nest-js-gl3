import { TimestampEntity } from "src/shared/entities/time-stamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Webhook extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  url!: string;

  @Column()
  secret!: string;

  @Column('simple-array')
  events!: string[];
}