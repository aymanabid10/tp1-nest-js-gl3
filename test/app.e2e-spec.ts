import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import * as http from 'http';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Role } from '../src/shared/enums/role.enum';
import { User } from '../src/user/entities/user.entity';

interface AuthenticatedUser {
  id: number;
  token: string;
  email: string;
}

interface ParsedSseEvent {
  id?: string;
  event?: string;
  data?: Record<string, unknown>;
}

interface SseClient {
  close: () => void;
  events: ParsedSseEvent[];
  waitForEvent: (
    predicate: (event: ParsedSseEvent) => boolean,
  ) => Promise<ParsedSseEvent>;
}

describe('CV SSE events (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let baseUrl: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    await app.listen(0);

    httpServer = app.getHttpServer() as Server;
    baseUrl = await app.getUrl();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await resetDatabase(dataSource);
  });

  afterEach(() => {
    httpServer.closeAllConnections?.();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated SSE connections', async () => {
    await request(httpServer).get('/cv-events/stream').expect(401);
  });

  it('notifies the CV owner and admin, but not other users, when a CV is created', async () => {
    const owner = await createUser('owner');
    const otherUser = await createUser('other');
    const admin = await createUser('admin', Role.ADMIN);

    const ownerStream = await openSseStream(baseUrl, owner.token);
    const otherUserStream = await openSseStream(baseUrl, otherUser.token);
    const adminStream = await openSseStream(baseUrl, admin.token);

    try {
      const cvResponse = await createCv(owner.token, {
        name: 'Doe',
        firstname: 'Jane',
        cin: 'TN10000001',
      });

      const ownerEvent = await ownerStream.waitForEvent(
        (event) =>
          event.event === 'cv.created' && event.data?.cvId === cvResponse.id,
      );
      const adminEvent = await adminStream.waitForEvent(
        (event) =>
          event.event === 'cv.created' && event.data?.cvId === cvResponse.id,
      );

      expect(ownerEvent.data).toEqual(
        expect.objectContaining({
          type: 'CREATED',
          cvId: cvResponse.id,
          authorId: owner.id,
          targetOwnerId: owner.id,
        }),
      );
      expect(adminEvent.data).toEqual(
        expect.objectContaining({
          type: 'CREATED',
          cvId: cvResponse.id,
          authorId: owner.id,
          targetOwnerId: owner.id,
        }),
      );
      expect(JSON.stringify(ownerEvent.data)).not.toMatch(
        /password|salt|@example\.com/,
      );
      expect(JSON.stringify(adminEvent.data)).not.toMatch(
        /password|salt|@example\.com/,
      );
      expect(otherUserStream.events).toHaveLength(0);

      await waitForHistoryEvent(admin.token, cvResponse.id, 'CREATED');
    } finally {
      ownerStream.close();
      otherUserStream.close();
      adminStream.close();
    }
  });

  it('streams update and delete events without breaking CV history persistence', async () => {
    const owner = await createUser('owner');
    const admin = await createUser('admin', Role.ADMIN);
    const cv = await createCv(owner.token, {
      name: 'Before',
      firstname: 'History',
      cin: 'TN10000002',
    });
    const adminStream = await openSseStream(baseUrl, admin.token);

    try {
      await request(httpServer)
        .patch(`/cv/${cv.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ job: 'Senior Engineer' })
        .expect(200);

      await request(httpServer)
        .delete(`/cv/${cv.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .expect(200);

      await adminStream.waitForEvent(
        (event) => event.event === 'cv.updated' && event.data?.cvId === cv.id,
      );
      await adminStream.waitForEvent(
        (event) => event.event === 'cv.deleted' && event.data?.cvId === cv.id,
      );

      expect(JSON.stringify(adminStream.events)).not.toMatch(
        /password|salt|@example\.com/,
      );

      const historyResponse = await request(httpServer)
        .get(`/cv-history/${cv.id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(historyResponse.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ eventType: 'CREATED', cvId: cv.id }),
          expect.objectContaining({ eventType: 'UPDATED', cvId: cv.id }),
          expect.objectContaining({ eventType: 'DELETED', cvId: cv.id }),
        ]),
      );
    } finally {
      adminStream.close();
    }
  });

  it('keeps normal CV ownership enforcement intact', async () => {
    const owner = await createUser('owner');
    const otherUser = await createUser('other');
    const admin = await createUser('admin', Role.ADMIN);
    const cv = await createCv(owner.token, {
      name: 'Private',
      firstname: 'Owner',
      cin: 'TN10000003',
    });

    await request(httpServer)
      .get(`/cv/${cv.id}`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .expect(404);

    await request(httpServer)
      .get(`/cv/${cv.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.id).toBe(cv.id);
      });

    await waitForHistoryEvent(admin.token, cv.id, 'READ');
  });

  async function createUser(
    label: string,
    role: Role = Role.USER,
  ): Promise<AuthenticatedUser> {
    const unique = `${label}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
    const email = `${unique}@example.com`;
    const password = 'StrongPass123';

    const signupResponse = await request(httpServer)
      .post('/auth/signup')
      .send({
        username: unique.slice(0, 20),
        email,
        password,
      })
      .expect(201);

    if (role !== Role.USER) {
      await dataSource
        .getRepository(User)
        .update({ id: signupResponse.body.user.id }, { role });
    }

    const signinResponse = await request(httpServer)
      .post('/auth/signin')
      .send({ email, password })
      .expect(201);

    return {
      id: signinResponse.body.user.id,
      token: signinResponse.body.access_token,
      email,
    };
  }

  async function createCv(
    token: string,
    overrides: Partial<{
      name: string;
      firstname: string;
      age: number;
      cin: string;
      job: string;
      path: string;
    }> = {},
  ) {
    const response = await request(httpServer)
      .post('/cv')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Doe',
        firstname: 'Jane',
        age: 30,
        cin: 'TN12345678',
        job: 'Engineer',
        path: '/uploads/cv.pdf',
        ...overrides,
      })
      .expect(201);

    return response.body;
  }

  async function waitForHistoryEvent(
    token: string,
    cvId: number,
    eventType: string,
  ): Promise<void> {
    const deadline = Date.now() + 3000;

    while (Date.now() < deadline) {
      const response = await request(httpServer)
        .get(`/cv-history/${cvId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      if (
        response.body.some(
          (history: { eventType: string }) => history.eventType === eventType,
        )
      ) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error(`Timed out waiting for ${eventType} history event`);
  }
});

async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    TRUNCATE TABLE
      "cv_history",
      "cv_skills_skill",
      "cv",
      "skill",
      "user"
    RESTART IDENTITY CASCADE
  `);
}

function openSseStream(baseUrl: string, token: string): Promise<SseClient> {
  return new Promise((resolve, reject) => {
    const events: ParsedSseEvent[] = [];
    const waiters: Array<{
      predicate: (event: ParsedSseEvent) => boolean;
      resolve: (event: ParsedSseEvent) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }> = [];
    let buffer = '';

    const request = http.get(
      `${baseUrl}/cv-events/stream`,
      {
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
        },
      },
      (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`SSE stream failed with ${response.statusCode}`));
          response.resume();
          return;
        }

        response.setEncoding('utf8');
        response.on('data', (chunk: string) => {
          buffer += chunk;
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const parsedEvent = parseSseEvent(part);

            if (!parsedEvent.data) {
              continue;
            }

            events.push(parsedEvent);
            resolveMatchingWaiters(parsedEvent, waiters);
          }
        });

        resolve({
          close: () => {
            for (const waiter of waiters.splice(0)) {
              clearTimeout(waiter.timeout);
              waiter.reject(new Error('SSE stream closed'));
            }
            request.destroy();
          },
          events,
          waitForEvent: (predicate) =>
            waitForSseEvent(predicate, events, waiters),
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error('SSE stream connection timed out'));
    });
  });
}

function waitForSseEvent(
  predicate: (event: ParsedSseEvent) => boolean,
  events: ParsedSseEvent[],
  waiters: Array<{
    predicate: (event: ParsedSseEvent) => boolean;
    resolve: (event: ParsedSseEvent) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>,
): Promise<ParsedSseEvent> {
  const existingEvent = events.find(predicate);

  if (existingEvent) {
    return Promise.resolve(existingEvent);
  }

  return new Promise((resolve, reject) => {
    const waiter = {
      predicate,
      resolve,
      reject,
      timeout: setTimeout(() => {
        const index = waiters.indexOf(waiter);

        if (index >= 0) {
          waiters.splice(index, 1);
        }

        reject(new Error('Timed out waiting for SSE event'));
      }, 3000),
    };

    waiters.push(waiter);
  });
}

function resolveMatchingWaiters(
  event: ParsedSseEvent,
  waiters: Array<{
    predicate: (event: ParsedSseEvent) => boolean;
    resolve: (event: ParsedSseEvent) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>,
): void {
  for (const waiter of [...waiters]) {
    if (!waiter.predicate(event)) {
      continue;
    }

    clearTimeout(waiter.timeout);
    waiters.splice(waiters.indexOf(waiter), 1);
    waiter.resolve(event);
  }
}

function parseSseEvent(rawEvent: string): ParsedSseEvent {
  const parsedEvent: ParsedSseEvent = {};

  for (const line of rawEvent.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex < 0) {
      continue;
    }

    const field = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 1).trimStart();

    if (field === 'id') {
      parsedEvent.id = value;
    }

    if (field === 'event') {
      parsedEvent.event = value;
    }

    if (field === 'data') {
      parsedEvent.data = JSON.parse(value) as Record<string, unknown>;
    }
  }

  return parsedEvent;
}
