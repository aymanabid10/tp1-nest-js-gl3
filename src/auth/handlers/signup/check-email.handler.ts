import { ConflictException, Injectable } from '@nestjs/common';
import { SignupChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CheckEmailHandler extends AbstractHandler<SignupChainData> {
  constructor(private readonly userService: UserService) {
    super();
  }

  async handle(data: SignupChainData): Promise<SignupChainData> {
    const user = await this.userService.findByEmail(data.email);
    if (user) throw new ConflictException('Email exists');

    return super.handle(data);
  }
}
