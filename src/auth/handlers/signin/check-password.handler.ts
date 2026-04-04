import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CheckPasswordHandler extends AbstractHandler<any> {
  async handle(data: any) {
    const hashedPwd = await bcrypt.hash(data.password, data.user.salt);
    const valid = hashedPwd === data.user.password;
    if (!valid) throw new UnauthorizedException('Invalid password');

    return super.handle(data);
  }
}   