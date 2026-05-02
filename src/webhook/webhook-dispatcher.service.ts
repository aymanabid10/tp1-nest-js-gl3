import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Webhook } from "./entities/webhook.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { IdempotencyService } from "./idempotency.service";

@Injectable()
export class WebhookDispatcherService {
  constructor(
    @InjectRepository(Webhook) private repo: Repository<Webhook>,
    @InjectQueue('outgoing-webhooks') private queue: Queue,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async dispatch(event: string, data: any) {
    const webhooks = await this.repo.find();

    const eventId = `event:${event}:${data.candidateId}`;
  
    // Ensure idempotency
    const shouldProcess = await this.idempotencyService.ensureIdempotent(
      eventId
    );
    if (!shouldProcess) {
      return;
    }

    for (const webhook of webhooks) {
      if (!webhook.events.includes(event)) continue;
  
      // Enqueue the webhook for asynchronous processing
      await this.queue.add('send-webhook', {
        webhook,
        payload: { event, data },
        deliveryId: `${eventId}:webhook:${webhook.id}`,
        backoff : { type: 'exponential', delay: 3000 },
        attempts: 5,
        removeOnComplete: true,
      });
    }
  }
}