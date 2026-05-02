import { CvEvent, CvEventType } from 'src/cv-history/events/cv.event';
import { CvSseEventMapper } from './cv-sse-event.mapper';

describe('CvSseEventMapper', () => {
  let mapper: CvSseEventMapper;

  beforeEach(() => {
    mapper = new CvSseEventMapper();
  });

  it('maps a CV event to the public SSE event DTO', () => {
    const event = new CvEvent(CvEventType.CREATED, 1, 2, 3, {
      id: 3,
      name: 'Doe',
      firstname: 'Jane',
      age: 30,
      cin: 'TN12345678',
      job: 'Engineer',
      path: '/uploads/cv.pdf',
      user: { id: 2 },
      skills: [{ id: 7, designation: 'NestJS' }],
    });

    const dto = mapper.toDto(event);

    expect(dto).toEqual(
      expect.objectContaining({
        type: CvEventType.CREATED,
        cvId: 3,
        authorId: 1,
        targetOwnerId: 2,
        payload: expect.objectContaining({
          id: 3,
          name: 'Doe',
          firstname: 'Jane',
          age: 30,
          cin: 'TN12345678',
          job: 'Engineer',
          path: '/uploads/cv.pdf',
          userId: 2,
          skills: [
            expect.objectContaining({
              id: 7,
              designation: 'NestJS',
            }),
          ],
        }),
      }),
    );
  });

  it('sanitizes CV payloads before publishing them to SSE clients', () => {
    const event = new CvEvent(CvEventType.UPDATED, 1, 2, 3, {
      id: 3,
      name: 'Doe',
      firstname: 'Jane',
      age: 30,
      cin: 'TN12345678',
      job: 'Engineer',
      path: '/uploads/cv.pdf',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T01:00:00.000Z',
      deletedAt: null,
      user: {
        id: 2,
        username: 'jane',
        email: 'jane@example.com',
        password: 'hashed-password',
        salt: 'password-salt',
        role: 'user',
      },
      skills: [
        {
          id: 7,
          designation: 'NestJS',
          internalNotes: 'not for clients',
        },
      ],
      unexpected: 'not for clients',
    });

    const dto = mapper.toDto(event);

    expect(dto.payload).toEqual(
      expect.objectContaining({
        id: 3,
        name: 'Doe',
        firstname: 'Jane',
        age: 30,
        cin: 'TN12345678',
        job: 'Engineer',
        path: '/uploads/cv.pdf',
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T01:00:00.000Z',
        deletedAt: null,
        userId: 2,
        skills: [
          expect.objectContaining({
            id: 7,
            designation: 'NestJS',
          }),
        ],
      }),
    );
    expect(JSON.stringify(dto)).not.toMatch(
      /password|salt|jane@example.com|internalNotes|unexpected/,
    );
  });

  it('keeps delete events payload-free', () => {
    const event = new CvEvent(CvEventType.DELETED, 1, 2, 3);

    expect(mapper.toDto(event)).toEqual(
      expect.objectContaining({
        type: CvEventType.DELETED,
        payload: null,
      }),
    );
  });
});
