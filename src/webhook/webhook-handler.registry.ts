import { Injectable } from '@nestjs/common';
import { CvCreatedHandler } from './handlers/cv-created.handler';
import { CvScoredHandler } from './handlers/cv-scored.handler';

@Injectable()
export class WebhookHandlerRegistry {
  private handlers: Record<string, any>;

  constructor(
    private readonly cvCreated: CvCreatedHandler,
    private readonly cvScored: CvScoredHandler,
  ) {
    this.handlers = {
      'cv.created': this.cvCreated,
      'cv.scored': this.cvScored,
    };
  }

  getHandler(event: string) {
    return this.handlers[event];
  }
}