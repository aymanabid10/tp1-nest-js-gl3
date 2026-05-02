import { Injectable } from '@nestjs/common';
import { CvEvent } from 'src/cv-history/events/cv.event';
import { CvSseEventDto } from '../dto/cv-sse-event.dto';
import { CvSsePayloadDto } from '../dto/cv-sse-payload.dto';

@Injectable()
export class CvSseEventMapper {
  toDto(event: CvEvent & { eventType: CvSseEventDto['type'] }): CvSseEventDto {
    return {
      id: `${event.eventType}:${event.cvId ?? 'pending'}:${Date.now()}`,
      type: event.eventType,
      cvId: event.cvId,
      authorId: event.authorId,
      targetOwnerId: event.targetOwnerId,
      payload: event.payload ? CvSsePayloadDto.fromRecord(event.payload) : null,
      occurredAt: new Date().toISOString(),
    };
  }
}
