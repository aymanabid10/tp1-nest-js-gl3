import { Injectable } from "@nestjs/common";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";

@Injectable()
export class SendEmailHandler extends AbstractHandler<any> {
  async handle(data: any) {
    console.log('Send verification email...');
    return super.handle(data);
  }
}