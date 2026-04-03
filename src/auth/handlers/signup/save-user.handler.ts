import { Injectable } from '@nestjs/common';
import { SignupChainData } from 'src/auth/interface/auth-flow.interface';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SaveUserHandler extends AbstractHandler<SignupChainData> {
  constructor(private userService: UserService) {
    super();
  }

  async handle(data: SignupChainData): Promise<SignupChainData> {
    const user = await this.userService.create(data);

    return super.handle({
      ...data,
      createdUser: user,
    });
  }
}
