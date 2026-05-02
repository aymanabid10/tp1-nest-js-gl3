import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WebhookService } from '../webhook.service';
import { IdempotencyService } from '../idempotency.service';

@Processor('incoming-webhooks')
export class IncomingProcessor extends WorkerHost {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly idempotencyService: IdempotencyService,
    ) {
    super();
  }

  async process(job: Job) {
    let { eventId, payload } = job.data;
    console.log('Processing incoming webhook event:', payload);
    const id = 
      eventId 
      ??
      `incoming:${payload.event}:${JSON.stringify(payload.data)}`;
    
      // Ensure idempotency
    
    const shouldProcess = await this.idempotencyService.ensureIdempotent(id);
    if (!shouldProcess) {
      return {
        skipped: true,
      }
    }
    
    // Process the incoming event
    await this.webhookService.processIncomingEvent(payload);
  }
}