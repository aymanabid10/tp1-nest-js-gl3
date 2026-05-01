import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PayloadInterface } from 'src/auth/interface/payload.interface';
import { CvEventType } from 'src/cv-history/events/cv.event';
import { Role } from 'src/shared/enums/role.enum';
import { CvSseEventDto } from './dto/cv-sse-event.dto';

@Injectable()
export class CvEventsStreamService {
  private readonly events$ = new Subject<CvSseEventDto>();

  publish(event: CvSseEventDto): void {
    this.events$.next(event);
  }

  streamFor(user: PayloadInterface): Observable<MessageEvent> {
    return this.events$.pipe(
      filter((event) => this.canReceiveEvent(user, event)),
      map((event) => ({
        id: event.id,
        type: this.toSseEventName(event.type),
        data: event,
      })),
    );
  }

  private canReceiveEvent(
    user: PayloadInterface,
    event: CvSseEventDto,
  ): boolean {
    return user.role === Role.ADMIN || event.targetOwnerId === user.sub;
  }

  private toSseEventName(eventType: CvSseEventDto['type']): string {
    const eventNames = {
      [CvEventType.CREATED]: 'cv.created',
      [CvEventType.UPDATED]: 'cv.updated',
      [CvEventType.DELETED]: 'cv.deleted',
    };

    return eventNames[eventType];
  }
}
