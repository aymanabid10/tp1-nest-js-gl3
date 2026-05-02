import { Injectable } from '@nestjs/common';
import { WebhookEvent } from './entities/webhook-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(WebhookEvent)
    private repo: Repository<WebhookEvent>,
  ) {}

  async isProcessed(eventId: string): Promise<boolean> {
    return !!(await this.repo.findOne({ where: { eventId } }));
  }

  async markProcessed(eventId: string) {
    await this.repo.save({ eventId });
  }

  async ensureIdempotent(eventId: string): Promise<boolean> {
    // Check if the event has already been processed
    if (await this.isProcessed(eventId)) {
      return false;
    }
    // Mark the event as processed to prevent future duplicates
    await this.markProcessed(eventId);
    return true;
  }

  generateEventId(event: string, data: any): string {
    return `event:${event}:${data.candidateId}`;
}
}