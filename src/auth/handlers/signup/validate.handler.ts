import { BadRequestException, Injectable } from "@nestjs/common";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";

@Injectable()
export class ValidateSignupHandler extends AbstractHandler<any> {
  async handle(data: any) {
    if (!data.email || !data.password) {
      throw new BadRequestException('Invalid input');
    }
    return super.handle(data);
  }
}