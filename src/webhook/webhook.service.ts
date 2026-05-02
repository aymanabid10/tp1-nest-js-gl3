import { Injectable, Logger } from '@nestjs/common';
import { WebhookHandlerRegistry } from './webhook-handler.registry';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly registry: WebhookHandlerRegistry) {}

  async processIncomingEvent(payload: any) {
    this.logger.log(`Incoming webhook received: ${payload.event}`);

    const handler = this.registry.getHandler(payload.event);

    if (!handler) {
      this.logger.warn(`No handler for event: ${payload.event}`);
      return;
    }

    return handler.handle(payload.data);
  }
}