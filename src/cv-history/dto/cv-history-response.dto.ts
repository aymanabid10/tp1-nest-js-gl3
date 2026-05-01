import { ApiProperty } from '@nestjs/swagger';
import { CvOperationPhase, CvOperationType } from '../enums/cv-operation.enum';

export class CvHistoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

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
