import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CvEventType } from '../events/cv.event';

@Entity('cv_history')
export class CvHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'event_type', type: 'enum', enum: CvEventType })
  eventType!: CvEventType;

  @Column({ type: 'int' })
  authorId!: number;

  @Column({ name: 'target_owner_id', type: 'int' })
  targetOwnerId!: number;

  @Column({ type: 'int', nullable: true })
  cvId!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  performedAt!: Date;
}
