export class CvUpdateStartedEvent {
  constructor(
    public readonly authorId: number,
    public readonly cvId: number,
    public readonly partialPayload: Record<string, unknown>,
  ) {}
}
