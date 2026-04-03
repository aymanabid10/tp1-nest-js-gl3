import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashPasswordHandler } from './handlers/signup/hash-password.handler';
import { SaveUserHandler } from './handlers/signup/save-user.handler';
import { ValidateSignupHandler } from './handlers/signup/validate.handler';
import { CheckEmailHandler } from './handlers/signup/check-email.handler';
import { SignupDto } from './dto/sign-up.dto';
import { CheckPasswordHandler } from './handlers/signin/check-password.handler';
import { GenerateJwtHandler } from './handlers/signin/generate-jwt.handler';
import { SigninDto } from './dto/sign-in.dto';
import { ValidateUserHandler } from './handlers/signin/validate-user.handler';
import { SendEmailHandler } from './handlers/signin/send-email.handler';
import {
  SigninChainData,
  SigninResult,
  SignupChainData,
  SignupResult,
} from './interface/auth-flow.interface';

@Injectable()
export class AuthService {
  constructor(
    private validate: ValidateSignupHandler,
    private checkEmail: CheckEmailHandler,
    private hash: HashPasswordHandler,
    private save: SaveUserHandler,
    private validateUserHandler: ValidateUserHandler,
    private checkPasswordHandler: CheckPasswordHandler,
    private jwtHandler: GenerateJwtHandler,
    private email: SendEmailHandler,
  ) {}

  async signup(dto: SignupDto): Promise<SignupResult> {
    this.validate
      .setNext(this.checkEmail)
      .setNext(this.hash)
      .setNext(this.save)
      .setNext(this.email);

    const data = await this.validate.handle(dto as SignupChainData);

    if (!data.createdUser) {
      throw new InternalServerErrorException('Unable to create user');
    }

    return {
      user: {
        id: data.createdUser.id,
        username: data.createdUser.username,
        email: data.createdUser.email,
        role: data.createdUser.role,
      },
    };
  }

  async signin(dto: SigninDto): Promise<SigninResult> {
    this.validateUserHandler
      .setNext(this.checkPasswordHandler)
      .setNext(this.jwtHandler);

    const data = await this.validateUserHandler.handle(dto as SigninChainData);

    if (!data.access_token || !data.sanitizedUser) {
      throw new UnauthorizedException('Authentication failed');
    }

    return {
      access_token: data.access_token,
      user: data.sanitizedUser,
    };
  }
}
