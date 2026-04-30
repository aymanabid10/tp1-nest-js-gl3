import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    AuthModule,
    UserModule,
    JwtModule.register({
      secret: process.env.NODE_ENV === 'production' 
        ? process.env.JWT_SECRET 
        : process.env.JWT_SECRET ?? "default_secret",
    }),
  ],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
