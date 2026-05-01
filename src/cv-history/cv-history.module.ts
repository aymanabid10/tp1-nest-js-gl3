import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CvAuditListener } from './cv-audit.listener';
import { CvHistoryController } from './cv-history.controller';
import { CvHistoryService } from './cv-history.service';
import { CvHistory } from './entities/cv-history.entity';
import { CV_HISTORY_REPOSITORY } from './repositories/cv-history.repository.interface';
import { TypeOrmCvHistoryRepository } from './repositories/typeorm-cv-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CvHistory])],
  controllers: [CvHistoryController],
  providers: [
    {
      provide: CV_HISTORY_REPOSITORY,
      useClass: TypeOrmCvHistoryRepository,
    },
    CvAuditListener,
    CvHistoryService,
    RolesGuard,
  ],
})
export class CvHistoryModule {}
