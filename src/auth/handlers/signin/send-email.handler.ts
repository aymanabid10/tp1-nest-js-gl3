import { Injectable } from '@nestjs/common';
import { SignupChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';

@Injectable()
export class SendEmailHandler extends AbstractHandler<SignupChainData> {
  async handle(data: SignupChainData): Promise<SignupChainData> {
    console.log('Send verification email...');
    return super.handle(data);
  }
}
