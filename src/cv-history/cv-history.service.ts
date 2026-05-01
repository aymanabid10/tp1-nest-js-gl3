import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericService } from 'src/common/services/generic.service';
import { Repository } from 'typeorm';
import { CvHistory } from './entities/cv-history.entity';

@Injectable()
export class CvHistoryService extends GenericService<CvHistory> {
  constructor(
    @InjectRepository(CvHistory)
    private readonly cvHistoryRepository: Repository<CvHistory>,
  ) {
    super(cvHistoryRepository);
  }

  override findAll(): Promise<CvHistory[]> {
    return this.cvHistoryRepository.find({
      order: { performedAt: 'DESC' },
    });
  }

  findByCvId(cvId: number): Promise<CvHistory[]> {
    return this.cvHistoryRepository.find({
      where: { cvId },
      order: { performedAt: 'DESC' },
    });
  }
}
