import { Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { SignupChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';

@Injectable()
export class HashPasswordHandler extends AbstractHandler<SignupChainData> {
  async handle(data: SignupChainData): Promise<SignupChainData> {
    const salt = await genSalt();
    const password = await hash(data.password, salt);

    return super.handle({
      ...data,
      password,
      salt,
    });
  }
}
