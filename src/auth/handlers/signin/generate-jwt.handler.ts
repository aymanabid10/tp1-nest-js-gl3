import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PayloadInterface } from "src/auth/interface/payload.interface";
import { AbstractHandler } from "src/common/handlers/cor/abstract.handler";

@Injectable()
export class GenerateJwtHandler extends AbstractHandler<any> {
  constructor(private jwtService: JwtService) {
    super();
  }

  async handle(data: any) {
    const access_token = this.jwtService.sign({
      sub: data.user.id,
      email : data.user.email,
      role: data.user.role,
    } as PayloadInterface);

    delete data.user.password;
    delete data.user.salt;
    
    return {
      access_token,
      user: data.user,
    };
  }
}