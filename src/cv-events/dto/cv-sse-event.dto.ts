import { CvEventType } from 'src/cv-history/events/cv.event';
import { CvSsePayloadDto } from './cv-sse-payload.dto';

export class CvSseEventDto {
  id!: string;
  type!: CvEventType.CREATED | CvEventType.UPDATED | CvEventType.DELETED;
  cvId!: number | null;
  authorId!: number;
  targetOwnerId!: number;
  payload!: CvSsePayloadDto | null;
  occurredAt!: string;
}
