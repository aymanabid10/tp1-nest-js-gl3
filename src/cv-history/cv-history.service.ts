import { Inject, Injectable } from '@nestjs/common';
import { CvHistory } from './entities/cv-history.entity';
import {
  CV_HISTORY_REPOSITORY,
  CvHistoryRepositoryInterface,
} from './repositories/cv-history.repository.interface';

@Injectable()
export class CvHistoryService {
  constructor(
    @Inject(CV_HISTORY_REPOSITORY)
    private readonly cvHistoryRepository: CvHistoryRepositoryInterface,
  ) {}

  execute(cvId?: string): Promise<CvHistory[]> {
    if (cvId) {
      return this.cvHistoryRepository.findByCvId(Number(cvId));
    }

    return this.cvHistoryRepository.findAll();
  }
}
