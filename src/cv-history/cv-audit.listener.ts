import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvHistory } from './entities/cv-history.entity';
import { CvHistoryAuditService } from './cv-history-audit.service';
import { CV_EVENT, CvEvent } from './events/cv.event';

@Injectable()
export class CvAuditListener {
  constructor(private readonly cvHistoryAuditService: CvHistoryAuditService) {}

  @OnEvent(CV_EVENT)
  handleCvEvent(event: CvEvent): Promise<CvHistory> {
    return this.cvHistoryAuditService.recordEvent(event);
  }
}
