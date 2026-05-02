import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Webhook } from "./entities/webhook.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";

@Injectable()
export class WebhookDispatcherService {
  constructor(
    @InjectRepository(Webhook) private repo: Repository<Webhook>,
    @InjectQueue('outgoing-webhooks') private queue: Queue,
  ) {}

  async dispatch(event: string, data: any) {
    const webhooks = await this.repo.find();

    for (const webhook of webhooks) {
      if (!webhook.events.includes(event)) continue;
  
      const eventId = `${event}:${data.id}`;

      await this.queue.add('send-webhook', {
        webhook,
        payload: { event, data },
        backoff : { type: 'exponential', delay: 3000 },
        attempts: 5,
        removeOnComplete: true,
      });
    }
  }
}