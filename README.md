# TP3 NestJS CV Manager

Simple NestJS API for managing users, CVs, skills, CV audit history, and live CV persistence events.

## Features

- JWT authentication with `Authorization: Bearer <token>`
- Role-based authorization with `admin` and `user`
- CV ownership enforcement
- Paginated CV and skill listing
- CV audit history saved through domain events
- SSE stream for live CV persistence events
- PostgreSQL with TypeORM
- Swagger docs in non-production mode at `/api/docs`

## Main Modules

- `auth`: signup, signin, JWT strategy, guards, and roles
- `user`: user CRUD
- `skill`: skill CRUD
- `cv`: CV CRUD with ownership checks
- `cv-history`: persistent audit trail for CV events
- `cv-events`: SSE notifications for completed CV persistence operations

## CV SSE Events

The SSE endpoint is:

```http
GET /cv-events/stream
Authorization: Bearer <token>
```

It emits completed CV persistence events only:

- `cv.created`
- `cv.updated`
- `cv.deleted`

Admins receive all CV persistence events. Regular users only receive events for CVs they own, based on `targetOwnerId`.

Example event data:

```json
{
  "id": "CREATED:12:1777590856146",
  "type": "CREATED",
  "cvId": 12,
  "authorId": 4,
  "targetOwnerId": 4,
  "payload": {},
  "occurredAt": "2026-05-01T20:00:00.000Z"
}
```

Native browser `EventSource` cannot send custom `Authorization` headers. Browser clients should use a fetch-based SSE client/polyfill, or the auth design should be changed later to support cookies or short-lived stream tokens.

## Quick Start

1. Install dependencies

```bash
corepack pnpm install
```

2. Create environment file

Copy `.env.example` to `.env` and update values if needed.

3. Start PostgreSQL

```bash
docker compose -f compose.yml up -d
```

4. Run the app

```bash
corepack pnpm run start:dev
```

## Useful Commands

```bash
corepack pnpm run build
corepack pnpm run lint
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm run seed:cvs
docker compose -f compose.yml up -d
docker compose -f compose.yml logs --tail=300
```
