import { ConflictException, Injectable } from "@nestjs/common";
import { SignupDto } from "src/auth/dto/sign-up.dto";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";
import { UserService } from "src/user/user.service";

@Injectable()
export class CheckEmailHandler extends AbstractHandler<SignupDto> {
  constructor(
    private readonly userService: UserService,
  ) {
    super();
  }

  async handle(data: SignupDto): Promise<SignupDto> {
    const user = await this.userService.findByEmail(data.email);
    if (user) throw new ConflictException('Email exists');

    return super.handle(data);
  }
}