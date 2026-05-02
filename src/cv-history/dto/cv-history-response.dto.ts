import { ApiProperty } from '@nestjs/swagger';
import { CvEventType } from '../events/cv.event';

export class CvHistoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ enum: CvEventType, example: CvEventType.CREATED })
  eventType!: CvEventType;

  @ApiProperty({ example: 1 })
  authorId!: number;

  @ApiProperty({ example: 1 })
  targetOwnerId!: number;

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
