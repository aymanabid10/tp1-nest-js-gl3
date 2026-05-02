import { firstValueFrom } from 'rxjs';
import { PayloadInterface } from 'src/auth/interface/payload.interface';
import { CvEventType } from 'src/cv-history/events/cv.event';
import { Role } from 'src/shared/enums/role.enum';
import { CvEventsStreamService } from './cv-events-stream.service';
import { CvSseEventDto } from './dto/cv-sse-event.dto';

describe('CvEventsStreamService', () => {
  let service: CvEventsStreamService;

  beforeEach(() => {
    service = new CvEventsStreamService();
  });

  it('allows admins to receive all CV persistence events', async () => {
    const admin = createUser(99, Role.ADMIN);
    const event = createEvent({ targetOwnerId: 12 });
    const messagePromise = firstValueFrom(service.streamFor(admin));

    service.publish(event);

    await expect(messagePromise).resolves.toEqual({
      id: event.id,
      type: 'cv.created',
      data: event,
    });
  });

  it('allows users to receive events for CVs they own', async () => {
    const user = createUser(12, Role.USER);
    const event = createEvent({ targetOwnerId: user.sub });
    const messagePromise = firstValueFrom(service.streamFor(user));

    service.publish(event);

    await expect(messagePromise).resolves.toEqual({
      id: event.id,
      type: 'cv.created',
      data: event,
    });
  });

  it('does not notify users about another user CV events', () => {
    const user = createUser(12, Role.USER);
    const observer = jest.fn();

    const subscription = service.streamFor(user).subscribe(observer);
    service.publish(createEvent({ targetOwnerId: 45 }));
    subscription.unsubscribe();

    expect(observer).not.toHaveBeenCalled();
  });

  it.each([
    [CvEventType.CREATED, 'cv.created'],
    [CvEventType.UPDATED, 'cv.updated'],
    [CvEventType.DELETED, 'cv.deleted'],
  ])('maps %s to the correct SSE event name', async (eventType, sseType) => {
    const admin = createUser(99, Role.ADMIN);
    const event = createEvent({ type: eventType });
    const messagePromise = firstValueFrom(service.streamFor(admin));

    service.publish(event);

    await expect(messagePromise).resolves.toEqual(
      expect.objectContaining({
        type: sseType,
      }),
    );
  });
});

function createUser(sub: number, role: Role): PayloadInterface {
  return {
    sub,
    role,
    email: `user-${sub}@example.com`,
  };
}

function createEvent(
  overrides: Partial<CvSseEventDto> = {},
): CvSseEventDto {
  return {
    id: 'event-1',
    type: CvEventType.CREATED,
    cvId: 3,
    authorId: 1,
    targetOwnerId: 1,
    payload: null,
    occurredAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  };
}
