import { TimestampEntity } from "src/shared/entities/time-stamp.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { WebhookStatus } from "../enums/webhook.enum";

@Entity()
export class WebhookDelivery extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  webhookId!: number;

  @Column()
  event!: string;

  @Column({ type: 'enum', enum: WebhookStatus, default: WebhookStatus.FAILED })
  status!: WebhookStatus;

  @Column({ nullable: true })
  responseCode!: number;

  @Column({ default: 0 })
  attempts!: number;
}