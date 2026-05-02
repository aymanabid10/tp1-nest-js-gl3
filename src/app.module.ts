import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { UserModule } from './user/user.module';
import { SkillModule } from './skill/skill.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { WebhookModule } from './webhook/webhook.module';
import dbConfig from './config/db.config';
import { BullModule } from '@nestjs/bullmq';
import { CvHistoryModule } from './cv-history/cv-history.module';
import { CvEventsModule } from './cv-events/cv-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('database')!,
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    CvModule,
    UserModule,
    SkillModule,
    AuthModule,
    WebhookModule,

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || "6379") ,
      },
    }),
    CvHistoryModule,
    CvEventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
