import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CvAuditListener } from './application/listeners/cv-audit.listener';
import { GetCvHistoryUseCase } from './application/use-cases/get-cv-history.use-case';
import { CvHistory } from './domain/entities/cv-history.entity';
import { CV_HISTORY_REPOSITORY } from './domain/ports/cv-history.repository.interface';
import { CvHistoryController } from './infrastructure/controllers/cv-history.controller';
import { TypeOrmCvHistoryRepository } from './infrastructure/persistence/typeorm-cv-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CvHistory])],
  controllers: [CvHistoryController],
  providers: [
    {
      provide: CV_HISTORY_REPOSITORY,
      useClass: TypeOrmCvHistoryRepository,
    },
    CvAuditListener,
    GetCvHistoryUseCase,
    RolesGuard,
  ],
})
export class CvHistoryModule {}
