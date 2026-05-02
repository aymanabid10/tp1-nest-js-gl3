import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SignatureService } from '../signature.service';
import { WebhookDelivery } from '../entities/webhook-delivery.entity';
import { Repository } from 'typeorm/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { WebhookStatus } from '../enums/webhook.enum';

@Processor('outgoing-webhooks')
export class OutgoingProcessor extends WorkerHost {
  constructor(
    private readonly signatureService: SignatureService,
    @InjectRepository(WebhookDelivery)
    private deliveryRepo: Repository<WebhookDelivery>,
  ) {
    super();
  }

  async process(job: Job) {
    const { webhook, payload } = job.data;

    const signature = this.signatureService.sign(payload, webhook.secret);

    try {
      const response = await axios.post(webhook.url, payload, {
        headers: { 'x-signature': signature },
        timeout: 5000,
      });

      await this.deliveryRepo.save({
        webhookId: webhook.id,
        event: payload.event,
        status: WebhookStatus.SUCESS,
        responseCode: response.status,
      });

    } catch (error) {
      await this.deliveryRepo.save({
        webhookId: webhook.id,
        event: payload.event,
        status: WebhookStatus.FAILED,
        attempts: job.attemptsMade,
      });

      throw error; // triggers retry
    }
  }
}