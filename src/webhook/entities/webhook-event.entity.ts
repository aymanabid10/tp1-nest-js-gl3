import { TimestampEntity } from "src/shared/entities/time-stamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WebhookEvent extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  eventId!: string;
}