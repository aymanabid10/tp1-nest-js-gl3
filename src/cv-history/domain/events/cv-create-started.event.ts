export class CvCreateStartedEvent {
  constructor(
    public readonly authorId: number,
    public readonly partialPayload: Record<string, unknown>,
  ) {}
}
