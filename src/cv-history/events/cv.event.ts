export const CV_EVENT = 'cv.event';

export enum CvEventType {
  CREATE_STARTED = 'CREATE_STARTED',
  CREATED = 'CREATED',
  READ = 'READ',
  UPDATE_STARTED = 'UPDATE_STARTED',
  UPDATED = 'UPDATED',
  DELETE_STARTED = 'DELETE_STARTED',
  DELETED = 'DELETED',
}

export class CvEvent {
  constructor(
    public readonly eventType: CvEventType,
    public readonly authorId: number,
    public readonly targetOwnerId: number,
    public readonly cvId: number | null = null,
    public readonly payload: Record<string, unknown> | null = null,
  ) {}
}
