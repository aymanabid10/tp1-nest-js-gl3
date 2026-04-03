import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';

@Injectable()
export class ValidateSignupHandler extends AbstractHandler<SignupChainData> {
  async handle(data: SignupChainData): Promise<SignupChainData> {
    if (!data.email || !data.password) {
      throw new BadRequestException('Invalid input');
    }

    return super.handle(data);
  }
}
