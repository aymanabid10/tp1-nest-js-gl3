import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageReaction, Room, RoomMember]),
    AuthModule,
    UserModule,
  ],
  controllers: [MessageController],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
