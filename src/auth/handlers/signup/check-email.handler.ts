import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SignupDto } from "src/auth/dto/sign-up.dto";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class CheckEmailHandler extends AbstractHandler<SignupDto> {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User> //TODO : inject service instead of repo when the User Service is implemented
  ) {
    super();
  }

  async handle(data: SignupDto): Promise<SignupDto> {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (user) throw new ConflictException('Email exists');

    return super.handle(data);
  }
}