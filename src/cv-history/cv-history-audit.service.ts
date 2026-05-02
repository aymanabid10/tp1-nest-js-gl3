import { Inject, Injectable } from '@nestjs/common';
import { CvHistory } from './entities/cv-history.entity';
import { CvEvent } from './events/cv.event';
import {
  CV_HISTORY_REPOSITORY,
  CvHistoryRepositoryInterface,
} from './repositories/cv-history.repository.interface';

@Injectable()
export class CvHistoryAuditService {
  constructor(
    @Inject(CV_HISTORY_REPOSITORY)
    private readonly cvHistoryRepository: CvHistoryRepositoryInterface,
  ) {}

  recordEvent(event: CvEvent): Promise<CvHistory> {
    const cvHistory = new CvHistory();
    cvHistory.eventType = event.eventType;
    cvHistory.authorId = event.authorId;
    cvHistory.targetOwnerId = event.targetOwnerId;
    cvHistory.cvId = event.cvId;
    cvHistory.payload = event.payload;

    return this.cvHistoryRepository.save(cvHistory);
  }
}
