import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvHistory } from './entities/cv-history.entity';
import { CvHistoryAuditService } from './cv-history-audit.service';
import { CvCreateStartedEvent } from './events/cv-create-started.event';
import { CvCreatedEvent } from './events/cv-created.event';
import { CvReadEvent } from './events/cv-read.event';
import { CvUpdateStartedEvent } from './events/cv-update-started.event';
import { CvUpdatedEvent } from './events/cv-updated.event';

@Injectable()
export class CvAuditListener {
  constructor(private readonly cvHistoryAuditService: CvHistoryAuditService) {}

  @OnEvent(CvCreateStartedEvent.name)
  handleCvCreateStarted(event: CvCreateStartedEvent): Promise<CvHistory> {
    return this.cvHistoryAuditService.recordCreateStarted(event);
  }

  @OnEvent(CvCreatedEvent.name)
  handleCvCreated(event: CvCreatedEvent): Promise<CvHistory> {
    return this.cvHistoryAuditService.recordCreated(event);
  }

  @OnEvent(CvUpdateStartedEvent.name)
  handleCvUpdateStarted(event: CvUpdateStartedEvent): Promise<CvHistory> {
    return this.cvHistoryAuditService.recordUpdateStarted(event);
  }

  @OnEvent(CvUpdatedEvent.name)
  handleCvUpdated(event: CvUpdatedEvent): Promise<CvHistory> {
    return this.cvHistoryAuditService.recordUpdated(event);
  }

  @OnEvent(CvReadEvent.name)
  handleCvRead(event: CvReadEvent): Promise<CvHistory> {
    return this.cvHistoryAuditService.recordRead(event);
  }
}
