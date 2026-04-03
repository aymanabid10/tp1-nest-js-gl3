import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { AuthUserMiddleware } from './middlewares/auth-user.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Cv])],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthUserMiddleware).forRoutes(CvController);
  }
}
