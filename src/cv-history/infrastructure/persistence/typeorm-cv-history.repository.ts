import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvHistory } from '../../domain/entities/cv-history.entity';
import { CvHistoryRepositoryInterface } from '../../domain/ports/cv-history.repository.interface';

@Injectable()
export class TypeOrmCvHistoryRepository implements CvHistoryRepositoryInterface {
  constructor(
    @InjectRepository(CvHistory)
    private readonly cvHistoryRepository: Repository<CvHistory>,
  ) {}

  save(cvHistory: CvHistory): Promise<CvHistory> {
    return this.cvHistoryRepository.save(cvHistory);
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
