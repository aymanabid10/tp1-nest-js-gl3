import { Body, Controller, Get, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SignatureService } from './signature.service';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('webhooks')
export class IncomingWebhookController {
  constructor(
    private readonly signatureService: SignatureService,
    @InjectQueue('incoming-webhooks') private queue: Queue,
  ) {}

  @Post("incoming")
  @HttpCode(200)
  async handle(
    @Body() body : any,
    @Headers('x-signature') signature: string,
  ) {    
    if (!this.signatureService.verify(body, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    await this.queue.add('process-incoming', {
      payload: body,
    });

    return { received: true };
  }

  @Get("signature")
  async getSignature(
    @Body() body : any,
    @Headers('x-secret') secret: string,
  ) {
    return this.signatureService.sign(body, secret);

  }
    
}