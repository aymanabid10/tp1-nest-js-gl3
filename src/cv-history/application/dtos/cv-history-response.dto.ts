import { ApiProperty } from '@nestjs/swagger';
import {
  CvOperationPhase,
  CvOperationType,
} from '../../domain/enums/cv-operation.enum';

export class CvHistoryResponseDto {
  @ApiProperty({ example: '5de8e4af-bf7d-4f6f-93a9-cf4a0f472d3e' })
  id!: string;

  @ApiProperty({ enum: CvOperationType, example: CvOperationType.CREATE })
  operationType!: CvOperationType;

  @ApiProperty({ enum: CvOperationPhase, example: CvOperationPhase.COMPLETED })
  operationPhase!: CvOperationPhase;

  @ApiProperty({ example: 1 })
  authorId!: number;

  @ApiProperty({ example: 12, nullable: true })
  cvId!: number | null;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z' })
  performedAt!: Date;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: { name: 'Doe', firstname: 'John' },
  })
  payload!: Record<string, unknown> | null;
}
