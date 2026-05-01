import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CvOperationPhase, CvOperationType } from '../enums/cv-operation.enum';

@Entity('cv_history')
export class CvHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: CvOperationType })
  operationType!: CvOperationType;

  @Column({ type: 'enum', enum: CvOperationPhase })
  operationPhase!: CvOperationPhase;

  @Column({ type: 'int' })
  authorId!: number;

  @Column({ type: 'int', nullable: true })
  cvId!: number | null;

  @Column({ type: 'jsonb', nullable: true })
  payload!: Record<string, unknown> | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  performedAt!: Date;
}
