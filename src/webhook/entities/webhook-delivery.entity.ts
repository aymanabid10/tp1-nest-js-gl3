import { TimestampEntity } from "src/shared/entities/time-stamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WebhookDelivery extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  webhookId!: number;

  @Column()
  event!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  responseCode!: number;

  @Column({ default: 0 })
  attempts!: number;
}