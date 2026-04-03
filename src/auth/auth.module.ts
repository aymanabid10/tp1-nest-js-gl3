import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/passport-jwt.strategy';

@Module({
  imports :[
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: {
        expiresIn: '1d',
      },
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy
  ]
})
export class AuthModule {}
