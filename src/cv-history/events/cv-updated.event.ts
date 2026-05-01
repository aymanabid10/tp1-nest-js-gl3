export class CvUpdatedEvent {
  constructor(
    public readonly authorId: number,
    public readonly cvId: number,
    public readonly payload: Record<string, unknown>,
  ) {}
}
