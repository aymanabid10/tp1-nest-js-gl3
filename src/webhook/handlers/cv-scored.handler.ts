import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventHandler } from '../interfaces/webhook-event-handler.interface';

@Injectable()
export class CvScoredHandler implements WebhookEventHandler {
  constructor(
  ) {}
  private readonly logger = new Logger(CvScoredHandler.name);

  async handle(data: any) {
    this.logger.log(`ATS CV scored for user ${data.userId}`);
    // TODO : update the CV score in the database
  }
}