import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventHandler } from '../interfaces/webhook-event-handler.interface';

@Injectable()
export class CvCreatedHandler implements WebhookEventHandler {

  async handle(data: any) {
    // business logic here
  }
}