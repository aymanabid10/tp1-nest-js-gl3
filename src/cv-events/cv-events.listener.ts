import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  CV_EVENT,
  CV_PERSISTENCE_EVENT_TYPES,
  CvEvent,
  CvEventType,
} from 'src/cv-history/events/cv.event';
import { CvSseEventDto } from './dto/cv-sse-event.dto';
import { CvEventsStreamService } from './cv-events-stream.service';
import { CvSseEventMapper } from './mappers/cv-sse-event.mapper';

@Injectable()
export class CvEventsListener {
  constructor(
    private readonly streamService: CvEventsStreamService,
    private readonly sseEventMapper: CvSseEventMapper,
  ) {}

  @OnEvent(CV_EVENT)
  handleCvEvent(event: CvEvent): void {
    if (!this.isPersistenceEvent(event)) {
      return;
    }

    this.streamService.publish(this.sseEventMapper.toDto(event));
  }

  private isPersistenceEvent(
    event: CvEvent,
  ): event is CvEvent & { eventType: CvSseEventDto['type'] } {
    const persistenceEventTypes: readonly CvEventType[] =
      CV_PERSISTENCE_EVENT_TYPES;

    return persistenceEventTypes.includes(event.eventType);
  }
}
