import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class ValidateUserHandler extends AbstractHandler<any> {
  constructor(
    @InjectRepository(User) private repo: Repository<User> //TODO : inject service instead of repo when the User Service is implemented
  ) {
    super();
  }

  async handle(data: any) {
    const user = await this.repo.findOne({ where: { email: data.email } });
    if (!user) throw new NotFoundException('User not found');

    return super.handle({ ...data, user });
  }
}