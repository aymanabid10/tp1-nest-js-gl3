import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WebhookService } from '../webhook.service';

@Processor('incoming-webhooks')
export class IncomingProcessor extends WorkerHost {
  constructor(
    private readonly webhookService: WebhookService,
    ) {
    super();
  }

  async process(job: Job) {
    const { payload } = job.data;

    await this.webhookService.processIncomingEvent(payload);
  }
}