import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericService } from 'src/common/services/generic.service';
import { Repository } from 'typeorm';
import { CvHistory } from '../entities/cv-history.entity';
import { CvHistoryRepositoryInterface } from './cv-history.repository.interface';

@Injectable()
export class TypeOrmCvHistoryRepository
  extends GenericService<CvHistory>
  implements CvHistoryRepositoryInterface
{
  constructor(
    @InjectRepository(CvHistory)
    private readonly cvHistoryRepository: Repository<CvHistory>,
  ) {
    super(cvHistoryRepository);
  }

  save(cvHistory: CvHistory): Promise<CvHistory> {
    return this.create(cvHistory);
  }

  findAll(): Promise<CvHistory[]> {
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
