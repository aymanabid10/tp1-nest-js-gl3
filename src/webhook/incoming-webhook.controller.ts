import { Body, Controller, Get, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SignatureService } from './signature.service';
import { InjectQueue } from '@nestjs/bullmq';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class IncomingWebhookController {
  constructor(
    private readonly signatureService: SignatureService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post("incoming")
  @HttpCode(200)
  async handle(
    @Body() body : any,
    @Headers('x-signature') signature: string,
  ) {    
    return this.webhookService.handleIncomingEvent(body, signature);
  }

  @Get("signature")
  async getSignature(
    @Body() body : any,
    @Headers('x-secret') secret: string,
  ) {
    return this.signatureService.sign(body, secret);

  }
    
}