import { CvEvent, CvEventType } from 'src/cv-history/events/cv.event';
import { CvEventsListener } from './cv-events.listener';
import { CvEventsStreamService } from './cv-events-stream.service';
import { CvSseEventMapper } from './mappers/cv-sse-event.mapper';

describe('CvEventsListener', () => {
  let streamService: { publish: jest.Mock };
  let mapper: { toDto: jest.Mock };
  let listener: CvEventsListener;

  beforeEach(() => {
    streamService = {
      publish: jest.fn(),
    };
    mapper = {
      toDto: jest.fn((event: CvEvent) => ({
        id: 'event-1',
        type: event.eventType,
        cvId: event.cvId,
        authorId: event.authorId,
        targetOwnerId: event.targetOwnerId,
        payload: event.payload,
        occurredAt: '2026-05-01T00:00:00.000Z',
      })),
    };
    listener = new CvEventsListener(
      streamService as unknown as CvEventsStreamService,
      mapper as unknown as CvSseEventMapper,
    );
  });

  it.each([
    CvEventType.CREATED,
    CvEventType.UPDATED,
    CvEventType.DELETED,
  ])('publishes completed persistence events to the SSE stream', (eventType) => {
    const event = new CvEvent(eventType, 1, 2, 3, { name: 'Jane Doe' });

    listener.handleCvEvent(event);

    expect(streamService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: eventType,
        cvId: 3,
        authorId: 1,
        targetOwnerId: 2,
        payload: { name: 'Jane Doe' },
      }),
    );
  });

  it.each([
    CvEventType.CREATE_STARTED,
    CvEventType.READ,
    CvEventType.UPDATE_STARTED,
    CvEventType.DELETE_STARTED,
  ])('ignores non-completed persistence event %s', (eventType) => {
    listener.handleCvEvent(new CvEvent(eventType, 1, 2, 3));

    expect(streamService.publish).not.toHaveBeenCalled();
    expect(mapper.toDto).not.toHaveBeenCalled();
  });
});
