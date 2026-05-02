import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { WebhookDispatcherService } from 'src/webhook/webhook-dispatcher.service';
import { WebhookModule } from 'src/webhook/webhook.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cv]), WebhookModule],
  controllers: [CvController],
  providers: [CvService, RolesGuard],
  exports: [CvService],
})
export class CvModule {}
