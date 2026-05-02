import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { WebhookHandlerRegistry } from './webhook-handler.registry';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SignatureService } from './signature.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly registry: WebhookHandlerRegistry,
    @InjectQueue('incoming-webhooks') private queue: Queue,
    private readonly signatureService: SignatureService,
    
  ) {}
  private readonly logger = new Logger(WebhookService.name);


  async processIncomingEvent(payload: any) {
    this.logger.log(`Incoming webhook received: ${payload.event}`);

    const handler = this.registry.getHandler(payload.event);

    if (!handler) {
      this.logger.warn(`No handler for event: ${payload.event}`);
      return;
    }

    return handler.handle(payload.data);
  }

  async handleIncomingEvent(body: any, signature: string) {
    // Implementation for handling incoming event
    if (!this.signatureService.verify(body, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    try {
      await this.queue.add('process-incoming', {
        payload: body,
      });
    } catch (error) {

      return { received: false, error: 'Queue unavailable' };
    }

    return { received: true };
  }
}