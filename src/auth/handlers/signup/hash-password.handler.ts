import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupDto } from 'src/auth/dto/sign-up.dto';
import { AbstractHandler } from 'src/common/handlers/cor/abstract.handler';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class HashPasswordHandler extends AbstractHandler<SignupDto> {
  async handle(data: SignupDto): Promise<SignupDto> {
    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);
    const user = {
        ...data,
        salt
    } as User;
    return super.handle(user);
  }
}