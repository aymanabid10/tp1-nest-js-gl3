import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  PublicUser,
  SigninChainData,
} from 'src/auth/interface/auth-flow.interface';
import { PayloadInterface } from 'src/auth/interface/payload.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';

@Injectable()
export class GenerateJwtHandler extends AbstractHandler<SigninChainData> {
  constructor(private jwtService: JwtService) {
    super();
  }

  handle(data: SigninChainData): Promise<SigninChainData> {
    if (!data.user) {
      throw new UnauthorizedException('User context missing');
    }

    const sanitizedUser: PublicUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
    };

    const access_token = this.jwtService.sign({
      sub: data.user.id,
      email: data.user.email,
      role: data.user.role,
    } as PayloadInterface);

    return Promise.resolve({
      ...data,
      access_token,
      sanitizedUser,
    });
  }
}
