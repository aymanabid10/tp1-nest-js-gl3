import { Injectable, NotFoundException } from "@nestjs/common";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";
import { UserService } from "src/user/user.service";

@Injectable()
export class ValidateUserHandler extends AbstractHandler<any> {
  constructor(
    private readonly userService: UserService,
  ) {
    super();
  }

  async handle(data: any) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) throw new NotFoundException('User not found');

    return super.handle({ ...data, user });
  }
}