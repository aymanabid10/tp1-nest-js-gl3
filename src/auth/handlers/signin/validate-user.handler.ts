import { Injectable, NotFoundException } from '@nestjs/common';
import { SigninChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ValidateUserHandler extends AbstractHandler<SigninChainData> {
  constructor(private readonly userService: UserService) {
    super();
  }

  async handle(data: SigninChainData): Promise<SigninChainData> {
    const user = await this.userService.findByEmail(data.email);
    if (!user) throw new NotFoundException('User not found');

    return super.handle({ ...data, user });
  }
}
