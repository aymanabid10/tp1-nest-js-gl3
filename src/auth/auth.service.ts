import { Injectable } from '@nestjs/common';
import { HashPasswordHandler } from './handlers/signup/hash-password.handler';
import { SaveUserHandler } from './handlers/signup/save-user.handler';
import { ValidateSignupHandler } from './handlers/signup/validate.handler';
import { CheckEmailHandler } from './handlers/signup/check-email.handler';
import { SignupDto } from './dto/sign-up.dto';
import { CheckPasswordHandler } from './handlers/signin/check-password.handler';
import { GenerateJwtHandler } from './handlers/signin/generate-jwt.handler';
import { SigninDto } from './dto/sign-in.dto';
import { ValidateUserHandler } from './handlers/signin/validate-user.handler';

@Injectable()
export class AuthService {
  constructor(
    private validate: ValidateSignupHandler,
    private checkEmail : CheckEmailHandler,
    private hash: HashPasswordHandler,
    private save: SaveUserHandler,
    private validateUserHandler : ValidateUserHandler,
    private checkPasswordHandler : CheckPasswordHandler,
    private jwtHandler: GenerateJwtHandler
    //private email: SendEmailHandler,
  ) {}

  async signup(dto: SignupDto) {
    this.validate
      .setNext(this.checkEmail)
      .setNext(this.hash)
      .setNext(this.save)
      //.setNext(this.email)

    return this.validate.handle(dto);
  }

  async signin(dto: SigninDto) {
    this.validateUserHandler
      .setNext(this.checkPasswordHandler)
      .setNext(this.jwtHandler);

    return this.validateUserHandler.handle(dto);
  }

}