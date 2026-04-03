import { Injectable } from "@nestjs/common";
import { SignupDto } from "src/auth/dto/sign-up.dto";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";

@Injectable()
export class SaveUserHandler extends AbstractHandler<SignupDto> {
  constructor(private userService: UserService) {
    super();
  }

  async handle(data: SignupDto): Promise<any> {
    const user = await this.userService.create(data);
    return super.handle({ ...data, ...user });
  }
}