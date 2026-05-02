import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventHandler } from '../interfaces/webhook-event-handler.interface';
import { CvService } from 'src/cv/cv.service';

@Injectable()
export class CvScoredHandler implements WebhookEventHandler {
  constructor(
    private readonly cvService: CvService
  ) {}
  private readonly logger = new Logger(CvScoredHandler.name);

  async handle(data: any) {
    this.logger.log(`ATS CV scored for user ${data.userId}`);
    return this.cvService.update(data.cvId, { score: data.score });
  }
}