import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/passport-jwt.strategy';
import { ValidateUserHandler } from './handlers/signin/validate-user.handler';
import { CheckPasswordHandler } from './handlers/signin/check-password.handler';
import { GenerateJwtHandler } from './handlers/signin/generate-jwt.handler';
import { PassportModule } from '@nestjs/passport';
import { CheckEmailHandler } from './handlers/signup/check-email.handler';
import { ValidateSignupHandler } from './handlers/signup/validate.handler';
import { SaveUserHandler } from './handlers/signup/save-user.handler';
import { HashPasswordHandler } from './handlers/signup/hash-password.handler';
import { UserModule } from 'src/user/user.module';
import { SendEmailHandler } from './handlers/signin/send-email.handler';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default_secret',
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,

    // CoR handlers
    ValidateSignupHandler,
    ValidateUserHandler,
    SaveUserHandler,
    HashPasswordHandler,
    CheckPasswordHandler,
    CheckEmailHandler,
    GenerateJwtHandler,
    SendEmailHandler,
  ],
})
export class AuthModule {}
