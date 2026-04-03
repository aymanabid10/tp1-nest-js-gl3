import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { SigninChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';

@Injectable()
export class CheckPasswordHandler extends AbstractHandler<SigninChainData> {
  async handle(data: SigninChainData): Promise<SigninChainData> {
    if (!data.user) {
      throw new UnauthorizedException('User context missing');
    }

    const valid = await compare(data.password, data.user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    return super.handle(data);
  }
}
