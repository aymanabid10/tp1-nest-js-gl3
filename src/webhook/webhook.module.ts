import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { IncomingWebhookController } from './incoming-webhook.controller';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { OutgoingProcessor } from './processors/outgoing.processor';
import { IncomingProcessor } from './processors/incoming.processor';
import { BullModule } from '@nestjs/bullmq';
import { WebhookService } from './webhook.service';
import { CvScoredHandler } from './handlers/cv-scored.handler';
import { WebhookHandlerRegistry } from './webhook-handler.registry';
import { CvCreatedHandler } from './handlers/cv-created.handler';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'incoming-webhooks' },
      { name: 'outgoing-webhooks' },
    ),
    TypeOrmModule.forFeature([
      Webhook,
      WebhookEvent,
      WebhookDelivery,
    ]),
  ],
  controllers: [IncomingWebhookController],
  providers: [
    WebhookService,
    WebhookDispatcherService,
    SignatureService,
    IncomingProcessor,
    OutgoingProcessor,

    // Handlers
    CvCreatedHandler,
    CvScoredHandler,
    WebhookHandlerRegistry,
  ],
  exports: [WebhookDispatcherService],
})
export class WebhookModule {}